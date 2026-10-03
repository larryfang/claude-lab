-- Keep the earlier report compatible while moving its privileged query outside the API schema.
create function private.learning_admin_report() returns jsonb language plpgsql security definer set search_path='' as $$
declare users jsonb; lessons jsonb; summary jsonb;
begin
 perform private.require_course_admin();
 with event_totals as (
  select user_id,max(last_seen) last_seen,sum(active_seconds) active_seconds,sum(quiz_attempts) attempts,sum(quiz_correct) correct
  from public.learning_daily group by user_id
 ), completed as (
  select s.user_id,count(*) total from public.learner_state s cross join public.lesson_catalog c
  where c.countable and s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb group by s.user_id
 ), journeys as (
  select p.user_id,p.display_name,u.email,p.created_at,t.last_seen,coalesce(t.active_seconds,0) active_seconds,
   coalesce(c.total,0) completed_lessons,coalesce(t.attempts,0) quiz_attempts,coalesce(t.correct,0) quiz_correct,
   s.state->'last' last_lesson,
   (select count(*) from public.lesson_catalog l where l.countable and l.course=s.state#>>'{last,c}'
     and (path.lessons is null or l.lesson=any(path.lessons))
     and coalesce(s.state#>array['courses',l.course,'completed',l.lesson],'false'::jsonb)<>'true'::jsonb) remaining_lessons
  from public.learner_profiles p join auth.users u on u.id=p.user_id left join public.learner_state s on s.user_id=p.user_id
  left join event_totals t on t.user_id=p.user_id left join completed c on c.user_id=p.user_id
  left join public.path_catalog path on path.course=s.state#>>'{last,c}' and path.path=s.state#>>'{last,p}'
 )
 select coalesce(jsonb_agg(row_data order by last_seen desc nulls last),'[]'::jsonb) into users from (
  select *,
   (last_seen<now()-interval '7 days' and remaining_lessons>0) likely_dropoff,
   case when last_lesson is null then 'not_started' when remaining_lessons=0 then 'completed'
    when last_seen<now()-interval '7 days' then 'paused' else 'active' end learning_status
  from journeys order by last_seen desc nulls last limit 200
 ) row_data;
 select coalesce(jsonb_agg(row_data),'[]'::jsonb) into lessons from (
  select c.course,c.lesson,c.title,c.countable,
   (select count(distinct d.user_id) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson and d.views>0) learners_started,
   (select count(*) from public.learner_state s where s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb) learners_completed,
   (select coalesce(sum(d.quiz_attempts),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson) quiz_attempts,
   (select coalesce(sum(d.quiz_correct),0) from public.learning_daily d where d.course=c.course and d.lesson=c.lesson) quiz_correct
  from public.lesson_catalog c order by c.course,c.lesson
 ) row_data;
 select jsonb_build_object('learners',(select count(*) from public.learner_profiles),
  'active_7_days',(select count(distinct user_id) from public.learning_daily where last_seen>now()-interval '7 days'),
  'events_30_days',(select coalesce(sum(events),0) from public.learning_daily where day>=((now() at time zone 'UTC')::date-29)),
  'active_seconds_30_days',(select coalesce(sum(active_seconds),0) from public.learning_daily where day>=((now() at time zone 'UTC')::date-29)),
  'database_bytes',pg_database_size(current_database()),'learner_limit',200,'generated_at',now()) into summary;
 return jsonb_build_object('summary',summary,'learners',users,'lessons',lessons);
end $$;
revoke all on function private.learning_admin_report() from public,anon,authenticated;
grant execute on function private.learning_admin_report() to authenticated;
create or replace function public.learning_admin_report() returns jsonb
language sql stable security invoker set search_path='' as $$ select private.learning_admin_report() $$;
revoke all on function public.learning_admin_report() from public,anon;
grant execute on function public.learning_admin_report() to authenticated;
