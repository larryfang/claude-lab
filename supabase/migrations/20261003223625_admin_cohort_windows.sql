-- Align the twelve signup cohorts to UTC Monday boundaries, including the current week.
create or replace function private.learning_admin_dashboard(
 p_days integer default 30, p_course text default '', p_query text default '',
 p_status text default '', p_offset integer default 0, p_limit integer default 25
) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare
 today date:=(now() at time zone 'UTC')::date; first_day date;
 summary jsonb; trend jsonb; courses jsonb; lessons jsonb; directory jsonb;
 providers jsonb; activation jsonb; cohorts jsonb; coverage jsonb;
begin
 perform private.require_course_admin();
 if p_days is null or p_days not in (7,30,90) or p_course is null or p_query is null or length(p_query)>80
  or p_status is null or p_status not in ('','active','paused','completed','not_started','no_activity')
  or p_offset is null or p_offset<0 or p_offset>100000 or p_limit is null or p_limit<1 or p_limit>100
  or (p_course<>'' and not exists(select 1 from public.lesson_catalog where course=p_course)) then
  raise exception 'Invalid report filters' using errcode='22023';
 end if;
 first_day:=today-p_days+1;
 with current_period as (
  select d.* from public.learning_daily d join public.lesson_catalog c using(course,lesson)
  where d.day between first_day and today and (p_course='' or d.course=p_course)
 ), previous_period as (
  select d.* from public.learning_daily d join public.lesson_catalog c using(course,lesson)
  where d.day between first_day-p_days and first_day-1 and (p_course='' or d.course=p_course)
 ) select jsonb_build_object(
  'registered_accounts',(select count(*) from public.learner_profiles),
  'new_accounts',(select count(*) from public.learner_profiles where created_at>=first_day::timestamp at time zone 'UTC'),
  'previous_new_accounts',(select count(*) from public.learner_profiles where created_at>= (first_day-p_days)::timestamp at time zone 'UTC' and created_at<first_day::timestamp at time zone 'UTC'),
  'active_learners',(select count(distinct user_id) from current_period),
  'previous_active_learners',(select count(distinct user_id) from previous_period),
  'lesson_views',(select coalesce(sum(views),0) from current_period),
  'previous_lesson_views',(select coalesce(sum(views),0) from previous_period),
  'active_seconds',(select coalesce(sum(active_seconds),0) from current_period),
  'previous_active_seconds',(select coalesce(sum(active_seconds),0) from previous_period),
  'quiz_attempts',(select coalesce(sum(quiz_attempts),0) from current_period),
  'quiz_correct',(select coalesce(sum(quiz_correct),0) from current_period),
  'completion_events',(select count(*) from public.learning_events where occurred_at>=first_day::timestamp at time zone 'UTC' and type='complete' and done and (p_course='' or course=p_course)),
  'learning_sessions',(select count(distinct (user_id,session_id)) from public.learning_events e join public.lesson_catalog c using(course,lesson) where occurred_at>=first_day::timestamp at time zone 'UTC' and (p_course='' or e.course=p_course)),
  'simulation_completions',(select count(*) from public.learning_events where occurred_at>=first_day::timestamp at time zone 'UTC' and type='simulation' and done and (p_course='' or course=p_course)),
  'studio_completions',(select count(*) from public.learning_events where occurred_at>=first_day::timestamp at time zone 'UTC' and type='studio' and done and p_course=''),
  'database_bytes',pg_database_size(current_database())
 ) into summary;

 select coalesce(jsonb_agg(row_data order by day),'[]'::jsonb) into trend from (
  select day::date,
   (select count(distinct d.user_id) from public.learning_daily d join public.lesson_catalog c using(course,lesson) where d.day=days.day::date and (p_course='' or d.course=p_course)) active_learners,
   (select coalesce(sum(d.views),0) from public.learning_daily d join public.lesson_catalog c using(course,lesson) where d.day=days.day::date and (p_course='' or d.course=p_course)) lesson_views,
   (select coalesce(sum(d.active_seconds),0) from public.learning_daily d join public.lesson_catalog c using(course,lesson) where d.day=days.day::date and (p_course='' or d.course=p_course)) active_seconds,
   (select count(*) from public.learner_profiles where (created_at at time zone 'UTC')::date=days.day::date) new_accounts
  from generate_series(first_day::timestamp,today::timestamp,interval '1 day') days(day)
 ) row_data;

 select coalesce(jsonb_agg(row_data order by course),'[]'::jsonb) into courses from (
  select cat.course,
   (select count(distinct d.user_id) from public.learning_daily d where d.course=cat.course and d.lesson in (select lesson from public.lesson_catalog where course=cat.course) and d.day between first_day and today) active_learners,
   (select coalesce(sum(d.views),0) from public.learning_daily d where d.course=cat.course and d.day between first_day and today) lesson_views,
   (select coalesce(sum(d.active_seconds),0) from public.learning_daily d where d.course=cat.course and d.day between first_day and today) active_seconds,
   (select coalesce(sum(d.quiz_attempts),0) from public.learning_daily d where d.course=cat.course and d.day between first_day and today) quiz_attempts,
   (select coalesce(sum(d.quiz_correct),0) from public.learning_daily d where d.course=cat.course and d.day between first_day and today) quiz_correct,
   (select count(*) from public.learner_state s where not exists(select 1 from public.lesson_catalog l where l.course=cat.course and l.countable and coalesce(s.state#>array['courses',l.course,'completed',l.lesson],'false'::jsonb)<>'true'::jsonb)) current_course_completers
  from (select distinct course from public.lesson_catalog where countable and (p_course='' or course=p_course)) cat
 ) row_data;

 select coalesce(jsonb_agg(row_data order by course,lesson),'[]'::jsonb) into lessons from (
  select c.course,c.lesson,c.title,c.countable,
   (select count(distinct d.user_id) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.views>0 and d.day between first_day and today) viewers,
   (select coalesce(sum(d.views),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.day between first_day and today) views,
   (select count(*) from public.learner_state s where s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb) current_completers,
   (select count(*) from public.learner_state s where s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb and exists(select 1 from public.learning_daily d where d.user_id=s.user_id and d.course=c.course and d.lesson=c.lesson and d.views>0 and d.day between first_day and today)) viewer_completers,
   (select coalesce(sum(d.quiz_attempts),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.day between first_day and today) quiz_attempts,
   (select coalesce(sum(d.quiz_correct),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.day between first_day and today) quiz_correct,
   (select coalesce(sum(d.active_seconds),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.day between first_day and today) active_seconds
  from public.lesson_catalog c where p_course='' or c.course=p_course
 ) row_data;

 with totals as (
  select d.user_id,max(d.last_seen) last_seen,
   coalesce(sum(d.active_seconds) filter(where d.day between first_day and today),0) active_seconds,
   coalesce(sum(d.quiz_attempts) filter(where d.day between first_day and today),0) quiz_attempts,
   coalesce(sum(d.quiz_correct) filter(where d.day between first_day and today),0) quiz_correct
  from public.learning_daily d join public.lesson_catalog c using(course,lesson)
  where p_course='' or d.course=p_course group by d.user_id
 ), base as (
  select p.user_id,p.display_name,u.email,p.created_at,t.last_seen,
   coalesce(t.active_seconds,0) active_seconds,coalesce(t.quiz_attempts,0) quiz_attempts,coalesce(t.quiz_correct,0) quiz_correct,
   coalesce(s.state,'{}'::jsonb) state,
   case when exists(select 1 from public.lesson_catalog l where l.course=s.state#>>'{last,c}' and l.lesson=s.state#>>'{last,l}') and (p_course='' or s.state#>>'{last,c}'=p_course) then s.state->'last' end last_lesson,
   (select count(*) from public.lesson_catalog l where l.countable and (p_course='' or l.course=p_course) and s.state#>array['courses',l.course,'completed',l.lesson]='true'::jsonb) completed_lessons
  from public.learner_profiles p join auth.users u on u.id=p.user_id
  left join public.learner_state s on s.user_id=p.user_id left join totals t on t.user_id=p.user_id
  where p_course='' or t.user_id is not null or exists(select 1 from public.lesson_catalog l where l.course=p_course and s.state#>array['courses',l.course,'completed',l.lesson]='true'::jsonb)
 ), selected as (
  select b.*,path.lessons path_lessons,
   case when path.lessons is not null and length(last_lesson->>'s') between 1 and 1500
    and last_lesson->>'l'=any(string_to_array(last_lesson->>'s',','))
    and not exists(select 1 from unnest(string_to_array(last_lesson->>'s',',')) with ordinality x(id,n)
      where array_position(path.lessons,x.id) is null or (x.n>1 and array_position(path.lessons,x.id)<=coalesce(array_position(path.lessons,(string_to_array(last_lesson->>'s',','))[x.n::int-1]),0)))
    then string_to_array(last_lesson->>'s',',') end session_lessons
  from base b left join public.path_catalog path on path.course=last_lesson->>'c' and path.path=last_lesson->>'p'
 ), journeys as (
  select s.*,
   case when session_lessons is not null then 'session' when path_lessons is not null then 'path' else 'course' end scope_kind,
   (select count(*) from public.lesson_catalog l where l.countable and l.course=coalesce(last_lesson->>'c',nullif(p_course,'')) and (coalesce(session_lessons,path_lessons) is null or l.lesson=any(coalesce(session_lessons,path_lessons)))) selected_lessons,
   (select count(*) from public.lesson_catalog l where l.countable and l.course=coalesce(last_lesson->>'c',nullif(p_course,'')) and (coalesce(session_lessons,path_lessons) is null or l.lesson=any(coalesce(session_lessons,path_lessons))) and coalesce(state#>array['courses',l.course,'completed',l.lesson],'false'::jsonb)<>'true'::jsonb) remaining_lessons
  from selected s
 ), statuses as (
  select user_id,display_name,email,created_at,last_seen,active_seconds,quiz_attempts,quiz_correct,last_lesson,completed_lessons,scope_kind,selected_lessons,remaining_lessons,
   case when selected_lessons>0 and remaining_lessons=0 then 'completed'
    when last_seen is null then case when last_lesson is null and completed_lessons=0 then 'not_started' else 'no_activity' end
    when last_seen<now()-interval '7 days' and remaining_lessons>0 then 'paused'
    else 'active' end learning_status
  from journeys
 ), matched as materialized (
  select * from statuses where (p_query='' or position(lower(p_query) in lower(display_name||' '||coalesce(email,'')))>0) and (p_status='' or learning_status=p_status)
 ) select jsonb_build_object('total',(select count(*) from matched),'offset',p_offset,'limit',p_limit,
   'rows',coalesce((select jsonb_agg(row_data order by last_seen desc nulls last,created_at desc,user_id) from (select * from matched order by last_seen desc nulls last,created_at desc,user_id limit p_limit offset p_offset) row_data),'[]'::jsonb),
   'statuses',(select coalesce(jsonb_object_agg(learning_status,n),'{}'::jsonb) from (select learning_status,count(*) n from statuses group by learning_status) counts)) into directory;

 select coalesce(jsonb_agg(row_data order by accounts desc,provider),'[]'::jsonb) into providers from (
  select case when u.raw_app_meta_data->>'provider' in ('google','github') then u.raw_app_meta_data->>'provider' else 'other' end provider,
   count(*) accounts,count(*) filter(where p.created_at>=first_day::timestamp at time zone 'UTC') new_accounts
  from auth.users u join public.learner_profiles p on p.user_id=u.id group by 1
 ) row_data;
 with joined as (
  select p.user_id,
   exists(select 1 from public.learning_daily d join public.lesson_catalog c using(course,lesson) where d.user_id=p.user_id and d.views>0 and d.day between first_day and today and (p_course='' or d.course=p_course)) opened_lesson,
   exists(select 1 from public.learning_events e where e.user_id=p.user_id and e.type='complete' and e.done and e.occurred_at>=p.created_at and (p_course='' or e.course=p_course)) recorded_completion
  from public.learner_profiles p where p.created_at>=first_day::timestamp at time zone 'UTC'
 ) select jsonb_build_object('accounts',count(*),'opened_lesson',count(*) filter(where opened_lesson),'opened_and_completed',count(*) filter(where opened_lesson and recorded_completion)) into activation from joined;

 select coalesce(jsonb_agg(row_data order by week),'[]'::jsonb) into cohorts from (
  select date_trunc('week',p.created_at at time zone 'UTC')::date week,count(*) accounts,
   count(*) filter(where (p.created_at at time zone 'UTC')::date+14<=today) eligible,
   count(*) filter(where (p.created_at at time zone 'UTC')::date+14<=today and exists(select 1 from public.learning_daily d join public.lesson_catalog c using(course,lesson) where d.user_id=p.user_id and d.day between (p.created_at at time zone 'UTC')::date+7 and (p.created_at at time zone 'UTC')::date+13 and (p_course='' or d.course=p_course))) returned
  from public.learner_profiles p where p.created_at>=((date_trunc('week',today::timestamp)-interval '11 weeks') at time zone 'UTC') group by 1
 ) row_data;
 select jsonb_build_object('first_daily_day',(select min(day) from public.learning_daily d join public.lesson_catalog c using(course,lesson)),
  'raw_retention_days',90,'daily_retention','until account deletion','timezone','UTC',
  'previous_period_complete',(select min(day)<=first_day-p_days from public.learning_daily d join public.lesson_catalog c using(course,lesson))) into coverage;
 return jsonb_build_object('version',1,'generated_at',now(),'filters',jsonb_build_object('days',p_days,'course',p_course,'from',first_day,'to',today,'query',p_query,'status',p_status),
  'summary',summary,'daily',trend,'courses',courses,'lessons',lessons,'directory',directory,'providers',providers,'activation',activation,'cohorts',cohorts,'coverage',coverage);
end $$;
