-- #1071: email confirmation must resume the precise saved orientation, not
-- another later orientation from the same public prospect.
-- The already-existing claim helper checks auth.users.email_confirmed_at and
-- exact email/user identity; temporary cookie/password never authorizes this.
create or replace function public.service_recover_and_confirm_provisional_orientation(
  p_user_id uuid,
  p_user_email text
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_prospect_id uuid;
  v_orientation_id uuid;
begin
  v_prospect_id := public.service_claim_prospect_by_verified_email(
    p_user_id, p_user_email
  );
  if v_prospect_id is null then
    return null;
  end if;

  select o.id into v_orientation_id
  from public.provisional_candidate_credentials c
  join public.orientations o on o.id = c.orientation_id
  where c.email = lower(btrim(p_user_email))
    and o.prospect_id = v_prospect_id
    and (c.verified_user_id is null or c.verified_user_id = p_user_id)
  limit 1;

  if v_orientation_id is null then
    return null;
  end if;

  return public.service_confirm_student_orientation(p_user_id, v_orientation_id);
end;
$$;

revoke execute on function public.service_recover_and_confirm_provisional_orientation(uuid, text)
  from public, anon, authenticated;
grant execute on function public.service_recover_and_confirm_provisional_orientation(uuid, text)
  to service_role;
