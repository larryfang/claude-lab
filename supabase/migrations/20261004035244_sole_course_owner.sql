-- One owner account, pinned to its existing trusted Google/GitHub identities.
-- Production identifiers are read privately from Auth, never checked into source.
create table private.course_admin_owner (
 singleton boolean primary key default true check (singleton),
 user_id uuid not null unique references auth.users(id) on delete cascade,
 google_provider_id text check (length(google_provider_id) between 1 and 255),
 github_provider_id text check (length(github_provider_id) between 1 and 255),
 check (google_provider_id is not null or github_provider_id is not null)
);
alter table private.course_admin_owner enable row level security;
revoke all on table private.course_admin_owner from public,anon,authenticated;

-- Preserve the existing confirmed owner; ambiguous configurations fail closed.
-- A fresh project stays without an administrator until privately provisioned.
do $$
declare owner_count integer;
begin
 select count(*) into owner_count from auth.users u
 where u.email_confirmed_at is not null and exists (
  select 1 from private.course_admin_emails a where lower(a.email)=lower(u.email)
 );
 if owner_count>1 then
  raise exception 'Configure exactly one confirmed course owner before this migration';
 end if;
 if exists (
  select 1 from auth.identities i join auth.users u on u.id=i.user_id
  where u.email_confirmed_at is not null and i.provider in ('google','github')
   and exists(select 1 from private.course_admin_emails a where lower(a.email)=lower(u.email))
  group by i.user_id,i.provider having count(*)>1
 ) then raise exception 'The course owner has ambiguous provider identities'; end if;
 insert into private.course_admin_owner(user_id,google_provider_id,github_provider_id)
 select u.id,max(i.provider_id) filter(where i.provider='google'),max(i.provider_id) filter(where i.provider='github')
 from auth.users u join auth.identities i on i.user_id=u.id and i.provider in ('google','github')
 where u.email_confirmed_at is not null and exists (
  select 1 from private.course_admin_emails a where lower(a.email)=lower(u.email)
 ) group by u.id;
end $$;

create or replace function private.require_course_admin() returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists (
  select 1 from private.course_admin_owner o join auth.users u on u.id=o.user_id
  where o.singleton and u.id=auth.uid() and u.email_confirmed_at is not null and exists (
   select 1 from auth.identities i where i.user_id=o.user_id and (
    (i.provider='google' and i.provider_id=o.google_provider_id) or
    (i.provider='github' and i.provider_id=o.github_provider_id)
   )
  )
 ) then raise exception 'Administrator access required' using errcode='42501'; end if;
 return true;
end $$;
revoke all on function private.require_course_admin() from public,anon,authenticated;
grant execute on function private.require_course_admin() to authenticated;
