-- P2.7C: atomically append an authenticated project update and its automatic qualification.
-- The RPC is service-role-only. Browser callers cannot supply or execute this boundary directly.

create or replace function public.append_phase2_orientation_qualification(
  p_prospect_id uuid,
  p_user_id uuid,
  p_expected_latest_orientation_id uuid,
  p_orientation_engine_version text,
  p_orientation_input jsonb,
  p_orientation_result jsonb,
  p_qualification_engine_version text,
  p_qualification_state public.prospect_qualification_state,
  p_reason_codes text[],
  p_missing_fields text[],
  p_verification_requirements text[],
  p_next_action text
)
returns table (
  orientation_id uuid,
  qualification_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_linked_user_id uuid;
  v_latest_orientation_id uuid;
  v_orientation_id uuid;
  v_qualification_id uuid;
begin
  if p_prospect_id is null
    or p_user_id is null
    or p_orientation_engine_version is null
    or char_length(p_orientation_engine_version) not between 1 and 80
    or p_qualification_engine_version is null
    or char_length(p_qualification_engine_version) not between 1 and 80
    or p_orientation_input is null
    or jsonb_typeof(p_orientation_input) <> 'object'
    or p_orientation_result is null
    or jsonb_typeof(p_orientation_result) <> 'object'
    or p_qualification_state is null
    or p_reason_codes is null
    or p_missing_fields is null
    or p_verification_requirements is null
    or p_next_action is null
    or char_length(p_next_action) not between 1 and 120
  then
    return;
  end if;

  if p_qualification_state = 'qualified_prospect'::public.prospect_qualification_state then
    return;
  end if;

  -- Serialize updates for one prospect and independently verify the server-resolved owner.
  select p.user_id
    into v_linked_user_id
  from public.prospects p
  where p.id = p_prospect_id
  for update;

  if not found
    or v_linked_user_id is null
    or v_linked_user_id <> p_user_id
  then
    return;
  end if;

  select o.id
    into v_latest_orientation_id
  from public.orientations o
  where o.prospect_id = p_prospect_id
  order by o.created_at desc, o.id desc
  limit 1;

  -- Fail closed when another update won the race after the caller loaded its project.
  if v_latest_orientation_id is distinct from p_expected_latest_orientation_id then
    return;
  end if;

  insert into public.orientations (
    prospect_id,
    engine_version,
    input,
    result
  )
  values (
    p_prospect_id,
    p_orientation_engine_version,
    p_orientation_input,
    p_orientation_result
  )
  returning id into v_orientation_id;

  insert into public.prospect_qualifications (
    orientation_id,
    engine_version,
    state,
    reason_codes,
    missing_fields,
    verification_requirements,
    next_action,
    origin
  )
  values (
    v_orientation_id,
    p_qualification_engine_version,
    p_qualification_state,
    p_reason_codes,
    p_missing_fields,
    p_verification_requirements,
    p_next_action,
    'automatic'::public.prospect_qualification_origin
  )
  returning id into v_qualification_id;

  return query
  select v_orientation_id, v_qualification_id;
end;
$$;

revoke execute on function public.append_phase2_orientation_qualification(
  uuid,
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  text,
  public.prospect_qualification_state,
  text[],
  text[],
  text[],
  text
) from public, anon, authenticated;

grant execute on function public.append_phase2_orientation_qualification(
  uuid,
  uuid,
  uuid,
  text,
  jsonb,
  jsonb,
  text,
  public.prospect_qualification_state,
  text[],
  text[],
  text[],
  text
) to service_role;
