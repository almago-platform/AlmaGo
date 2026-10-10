-- Do not create a temporary password identity for an address already
-- confirmed by a real Supabase Auth account. This prevents a fake signup
-- response for an existing verified email from creating a competing identity.
-- Auth still owns email confirmation; the pending credential owns only itself.
create or replace function public.reject_provisional_confirmed_email_collision()
returns trigger
language plpgsql security definer
set search_path = public, auth
as $$
begin
  if exists (
    select 1 from auth.users u
    where lower(btrim(u.email)) = new.email
      and u.email_confirmed_at is not null
  ) then
    raise exception 'temporary credential unavailable'
      using errcode = '23505';
  end if;
  return new;
end;
$$;

revoke execute on function public.reject_provisional_confirmed_email_collision()
  from public, anon, authenticated;
drop trigger if exists provisional_guard_existing_verified_emails
  on public.provisional_candidate_credentials;
create trigger provisional_guard_existing_verified_emails
  before insert on public.provisional_candidate_credentials
  for each row execute function public.reject_provisional_confirmed_email_collision();
