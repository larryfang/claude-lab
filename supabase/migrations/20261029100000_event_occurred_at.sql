-- Learning events carry the time they happened. Until now occurred_at was the upload time, so
-- offline activity and events queued until the next sign-in landed on the wrong day in daily
-- totals, activation and "active today". The browser sends occurred_at only when the published
-- cloud config sets "eventTime": true, so apply this migration before flipping that flag.
create or replace function public.record_learning_events(batch jsonb) returns integer language plpgsql security invoker set search_path='' as $$
declare e jsonb; n integer:=0; affected integer; happened_at timestamptz;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if jsonb_typeof(batch)<>'array' or jsonb_array_length(batch)>20 or octet_length(batch::text)>20000 then raise exception 'Invalid event batch'; end if;
 for e in select * from jsonb_array_elements(batch) loop
  if exists(select 1 from jsonb_object_keys(e) k where k not in ('id','session_id','type','course','lesson','section','active_seconds','correct','done','occurred_at')) then raise exception 'Unexpected event field'; end if;
  if e->>'type'<>'heartbeat' and coalesce((e->>'active_seconds')::integer,0)<>0 then raise exception 'Active time belongs to heartbeats'; end if;
  -- A client clock is not trusted beyond the retention window or into the future.
  -- A malformed value raises (22007/22008) rather than falling back; a null or absent value means now().
  happened_at:=least(greatest(coalesce((e->>'occurred_at')::timestamptz,now()),now()-interval '90 days'),now());
  insert into public.learning_events(user_id,id,session_id,type,course,lesson,section,active_seconds,correct,done,occurred_at)
  values(auth.uid(),(e->>'id')::uuid,(e->>'session_id')::uuid,e->>'type',nullif(e->>'course',''),nullif(e->>'lesson',''),e->>'section',coalesce((e->>'active_seconds')::integer,0),(e->>'correct')::boolean,(e->>'done')::boolean,happened_at)
  on conflict(user_id,id) do nothing;
  get diagnostics affected=row_count; n:=n+affected;
 end loop;
 return n;
end $$;
revoke all on function public.record_learning_events(jsonb) from public,anon;
grant execute on function public.record_learning_events(jsonb) to authenticated;
