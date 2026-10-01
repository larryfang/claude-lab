-- Learner records are private. Browser writes use the authenticated user's JWT.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table private.course_admin_emails(email text primary key);
-- Populate the administrator allowlist privately during provisioning.

create table public.learner_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '' check(length(display_name)<=120),
 created_at timestamptz not null default now()
);
create table public.learner_state (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null default '{}'::jsonb,
 revision bigint not null default 0,
 updated_at timestamptz not null default now(),
 check(jsonb_typeof(state)='object' and octet_length(state::text)<=200000)
);
create table public.lesson_catalog (
 course text not null, lesson text not null, title text not null, countable boolean not null,
 primary key(course,lesson)
);
create table public.learning_events (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 id uuid not null, session_id uuid not null,
 type text not null check(type in ('view','complete','quiz','simulation','studio','heartbeat')),
 course text, lesson text, section text,
 active_seconds integer not null default 0 check(active_seconds between 0 and 60),
 correct boolean, done boolean,
 occurred_at timestamptz not null default now(),
 primary key(user_id,id),
 foreign key(course,lesson) references public.lesson_catalog(course,lesson),
 check(section is null or length(section)<=120)
);
create index learning_events_user_time on public.learning_events(user_id,occurred_at desc);
create index learning_events_lesson_time on public.learning_events(course,lesson,occurred_at desc);

alter table public.learner_profiles enable row level security;
alter table public.learner_state enable row level security;
alter table public.learning_events enable row level security;
alter table public.lesson_catalog enable row level security;
revoke all on public.learner_profiles,public.learner_state,public.learning_events,public.lesson_catalog from anon, authenticated;
grant select on public.learner_profiles,public.learner_state,public.learning_events to authenticated;
grant update(display_name) on public.learner_profiles to authenticated;
grant insert,update on public.learner_state to authenticated;
grant insert on public.learning_events to authenticated;
grant select on public.lesson_catalog to anon,authenticated;
create policy own_profile_read on public.learner_profiles for select to authenticated using((select auth.uid())=user_id);
create policy own_profile_edit on public.learner_profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_state_read on public.learner_state for select to authenticated using((select auth.uid())=user_id);
create policy own_state_insert on public.learner_state for insert to authenticated with check((select auth.uid())=user_id);
create policy own_state_edit on public.learner_state for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy own_events_read on public.learning_events for select to authenticated using((select auth.uid())=user_id);
create policy own_events_insert on public.learning_events for insert to authenticated with check((select auth.uid())=user_id);
create policy public_catalog_read on public.lesson_catalog for select to anon,authenticated using(true);

create function private.create_learner_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.learner_profiles(user_id,display_name)
 values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',new.raw_user_meta_data->>'name','Learner'),120)) on conflict do nothing;
 return new;
end $$;
revoke all on function private.create_learner_profile() from public,anon,authenticated;
create trigger create_learner_profile after insert on auth.users for each row execute function private.create_learner_profile();

-- Compare-and-swap avoids silently overwriting another device's progress.
create function public.save_learning_state(expected_revision bigint, body jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
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

-- Identity comes from auth.uid(), never an event's submitted user_id.
create function public.record_learning_events(batch jsonb) returns integer language plpgsql security invoker set search_path='' as $$
declare e jsonb; n integer:=0; affected integer;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if jsonb_typeof(batch)<>'array' or jsonb_array_length(batch)>20 or octet_length(batch::text)>20000 then raise exception 'Invalid event batch'; end if;
 for e in select * from jsonb_array_elements(batch) loop
  if exists(select 1 from jsonb_object_keys(e) k where k not in ('id','session_id','type','course','lesson','section','active_seconds','correct','done')) then raise exception 'Unexpected event field'; end if;
  if e->>'type'<>'heartbeat' and coalesce((e->>'active_seconds')::integer,0)<>0 then raise exception 'Active time belongs to heartbeats'; end if;
  insert into public.learning_events(user_id,id,session_id,type,course,lesson,section,active_seconds,correct,done)
  values(auth.uid(),(e->>'id')::uuid,(e->>'session_id')::uuid,e->>'type',nullif(e->>'course',''),nullif(e->>'lesson',''),e->>'section',coalesce((e->>'active_seconds')::integer,0),(e->>'correct')::boolean,(e->>'done')::boolean)
  on conflict(user_id,id) do nothing;
  get diagnostics affected=row_count; n:=n+affected;
 end loop;
 return n;
end $$;
revoke all on function public.record_learning_events(jsonb) from public,anon;
grant execute on function public.record_learning_events(jsonb) to authenticated;

-- Administrative access uses a server-owned allowlist and verified account email.
create function public.learning_admin_report() returns jsonb language plpgsql security definer set search_path='' as $$
declare users jsonb; lessons jsonb; summary jsonb;
begin
 if auth.uid() is null or not exists(select 1 from auth.users u join private.course_admin_emails a on lower(u.email)=lower(a.email) where u.id=auth.uid() and u.email_confirmed_at is not null) then
  raise exception 'Administrator access required' using errcode='42501';
 end if;
 with event_totals as (
  select user_id,max(occurred_at) last_seen,sum(active_seconds) active_seconds,
   count(*) filter(where type='quiz') attempts,count(*) filter(where type='quiz' and correct) correct
  from public.learning_events group by user_id
 ), completed as (
  select s.user_id,count(*) total from public.learner_state s cross join public.lesson_catalog c
  where c.countable and s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb group by s.user_id
 )
 select coalesce(jsonb_agg(row_data order by last_seen desc nulls last),'[]'::jsonb) into users from (
  select p.user_id,p.display_name,u.email,p.created_at,t.last_seen,coalesce(t.active_seconds,0) active_seconds,
   coalesce(c.total,0) completed_lessons,coalesce(t.attempts,0) quiz_attempts,coalesce(t.correct,0) quiz_correct,
   s.state->'last' last_lesson,
   (coalesce(t.last_seen,p.created_at)<now()-interval '7 days' and coalesce(c.total,0)<(select count(*) from public.lesson_catalog where countable)) likely_dropoff
  from public.learner_profiles p join auth.users u on u.id=p.user_id left join public.learner_state s on s.user_id=p.user_id
  left join event_totals t on t.user_id=p.user_id left join completed c on c.user_id=p.user_id order by t.last_seen desc nulls last limit 200
 ) row_data;
 select coalesce(jsonb_agg(row_data),'[]'::jsonb) into lessons from (
  select c.course,c.lesson,c.title,c.countable,
   (select count(distinct e.user_id) from public.learning_events e where e.course=c.course and e.lesson=c.lesson and e.type='view') learners_started,
   (select count(*) from public.learner_state s where s.state#>array['courses',c.course,'completed',c.lesson]='true'::jsonb) learners_completed,
   (select count(*) from public.learning_events e where e.course=c.course and e.lesson=c.lesson and e.type='quiz') quiz_attempts,
   (select count(*) from public.learning_events e where e.course=c.course and e.lesson=c.lesson and e.type='quiz' and e.correct) quiz_correct
  from public.lesson_catalog c order by c.course,c.lesson
 ) row_data;
 select jsonb_build_object('learners',(select count(*) from public.learner_profiles),
  'active_7_days',(select count(distinct user_id) from public.learning_events where occurred_at>now()-interval '7 days'),
  'events_30_days',(select count(*) from public.learning_events where occurred_at>now()-interval '30 days'),
  'active_seconds_30_days',(select coalesce(sum(active_seconds),0) from public.learning_events where occurred_at>now()-interval '30 days'),
  'learner_limit',200,'generated_at',now()) into summary;
 return jsonb_build_object('summary',summary,'learners',users,'lessons',lessons);
end $$;
revoke all on function public.learning_admin_report() from public,anon;
grant execute on function public.learning_admin_report() to authenticated;
