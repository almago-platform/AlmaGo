-- Atomic database-side lockout independent of web worker / process memory.
alter table public.provisional_candidate_credentials
  add column failed_attempts integer not null default 0 check (failed_attempts between 0 and 10),
  add column locked_until timestamptz;

create or replace function public.record_provisional_login_failure(p_credential_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.provisional_candidate_credentials
  set failed_attempts = least(failed_attempts + 1, 10),
      locked_until = case when failed_attempts + 1 >= 5
        then now() + interval '15 minutes'
        else locked_until end
  where id = p_credential_id and verified_user_id is null and revoked_at is null;
end;
$$;
revoke execute on function public.record_provisional_login_failure(uuid) from public, anon, authenticated;
grant execute on function public.record_provisional_login_failure(uuid) to service_role;
