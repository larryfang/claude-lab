-- Aggregate daily activity before retaining only 90 days of raw events.
alter table private.course_admin_emails enable row level security;
revoke insert on public.learning_events from authenticated;
grant insert(user_id,id,session_id,type,course,lesson,section,active_seconds,correct,done) on public.learning_events to authenticated;
create table public.path_catalog (
 course text not null, path text not null, lessons text[] not null, primary key(course,path)
);
alter table public.path_catalog enable row level security;
revoke all on public.path_catalog from anon,authenticated;
grant select on public.path_catalog to anon,authenticated;
create policy public_path_read on public.path_catalog for select to anon,authenticated using(true);

create table public.learning_daily (
 user_id uuid not null references auth.users(id) on delete cascade,
 day date not null, course text not null default '', lesson text not null default '',
 views bigint not null default 0, events bigint not null default 0,
 quiz_attempts bigint not null default 0, quiz_correct bigint not null default 0,
 active_seconds bigint not null default 0, last_seen timestamptz not null,
 primary key(user_id,day,course,lesson)
);
alter table public.learning_daily enable row level security;
revoke all on public.learning_daily from anon,authenticated;
grant select on public.learning_daily to authenticated;
create policy own_daily_read on public.learning_daily for select to authenticated using((select auth.uid())=user_id);
create function private.aggregate_learning_event() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.learning_daily(user_id,day,course,lesson,views,events,quiz_attempts,quiz_correct,active_seconds,last_seen)
 values(new.user_id,(new.occurred_at at time zone 'UTC')::date,coalesce(new.course,''),coalesce(new.lesson,''),
  (new.type='view')::int,1,(new.type='quiz')::int,(new.type='quiz' and coalesce(new.correct,false))::int,new.active_seconds,new.occurred_at)
 on conflict(user_id,day,course,lesson) do update set
  views=learning_daily.views+excluded.views,events=learning_daily.events+1,
  quiz_attempts=learning_daily.quiz_attempts+excluded.quiz_attempts,quiz_correct=learning_daily.quiz_correct+excluded.quiz_correct,
  active_seconds=learning_daily.active_seconds+excluded.active_seconds,last_seen=greatest(learning_daily.last_seen,excluded.last_seen);
 return new;
end $$;
revoke all on function private.aggregate_learning_event() from public,anon,authenticated;
create trigger aggregate_learning_event after insert on public.learning_events for each row execute function private.aggregate_learning_event();
-- Backfill any activity collected before this migration.
insert into public.learning_daily(user_id,day,course,lesson,views,events,quiz_attempts,quiz_correct,active_seconds,last_seen)
 select user_id,(occurred_at at time zone 'UTC')::date,coalesce(course,''),coalesce(lesson,''),
 count(*) filter(where type='view'),count(*),count(*) filter(where type='quiz'),count(*) filter(where type='quiz' and correct),sum(active_seconds),max(occurred_at)
 from public.learning_events group by 1,2,3,4;

create or replace function public.learning_admin_report() returns jsonb language plpgsql security definer set search_path='' as $$
declare users jsonb; lessons jsonb; summary jsonb;
begin
 if auth.uid() is null or not exists(select 1 from auth.users u join private.course_admin_emails a on lower(u.email)=lower(a.email) where u.id=auth.uid() and u.email_confirmed_at is not null) then
  raise exception 'Administrator access required' using errcode='42501';
 end if;
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
revoke all on function public.learning_admin_report() from public,anon;
grant execute on function public.learning_admin_report() to authenticated;

create extension if not exists pg_cron;
select cron.schedule('claude-lab-event-retention','15 3 * * *',
 $$delete from public.learning_events where occurred_at<now()-interval '90 days';
 delete from cron.job_run_details where end_time<now()-interval '14 days';$$);

-- Include daily review scores in synced progress.
create or replace function public.save_learning_state(expected_revision bigint, body jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_row public.learner_state;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if jsonb_typeof(body)<>'object' or octet_length(body::text)>200000 or exists(select 1 from jsonb_object_keys(body) k where k not in ('courses','cards','activity','last','learning','daily')) then
  raise exception 'Invalid learning state' using errcode='22023';
 end if;
 insert into public.learner_state(user_id) values(auth.uid()) on conflict do nothing;
 select * into current_row from public.learner_state where user_id=auth.uid() for update;
 if current_row.revision<>expected_revision then raise exception 'Progress changed on another device' using errcode='PT409'; end if;
 update public.learner_state set state=body,revision=revision+1,updated_at=now() where user_id=auth.uid() returning * into current_row;
 return jsonb_build_object('state',current_row.state,'revision',current_row.revision);
end $$;
revoke all on function public.save_learning_state(bigint,jsonb) from public,anon;
grant execute on function public.save_learning_state(bigint,jsonb) to authenticated;
