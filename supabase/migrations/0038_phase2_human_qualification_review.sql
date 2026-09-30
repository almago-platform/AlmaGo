-- P2.7E: audited human qualification review for the latest prospect orientation.
-- Service-role-only. This function can promote only prospect_account -> qualified_prospect.

create or replace function public.review_phase2_prospect_qualification(
  p_admin_user_id uuid,
  p_orientation_id uuid,
  p_expected_latest_qualification_id uuid,
  p_decision public.prospect_qualification_state,
  p_review_reason text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_prospect_id uuid;
  v_user_id uuid;
  v_latest_orientation_id uuid;
  v_latest_qualification_id uuid;
  v_latest_state public.prospect_qualification_state;
  v_reason_codes text[];
  v_missing_fields text[];
  v_verification_requirements text[];
  v_access_status public.customer_lifecycle_status;
  v_new_qualification_id uuid;
begin
  if p_admin_user_id is null
    or p_orientation_id is null
    or p_expected_latest_qualification_id is null
    or p_decision is null
    or p_review_reason is null
    or char_length(btrim(p_review_reason)) not between 10 and 1000
    or p_decision not in (
      'needs_verification'::public.prospect_qualification_state,
      'qualified_prospect'::public.prospect_qualification_state
    )
  then
    return null;
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_admin_user_id
      and ur.role = 'admin'
  ) then
    return null;
  end if;

  -- Lock the prospect ownership row and independently resolve the account.
  select o.prospect_id, p.user_id
    into v_prospect_id, v_user_id
  from public.orientations o
  join public.prospects p on p.id = o.prospect_id
  where o.id = p_orientation_id
  for update of p;

  if not found or v_user_id is null then
    return null;
  end if;

  select o.id
    into v_latest_orientation_id
  from public.orientations o
  where o.prospect_id = v_prospect_id
  order by o.created_at desc, o.id desc
  limit 1;

  if v_latest_orientation_id is distinct from p_orientation_id then
    return null;
  end if;

  select
    q.id,
    q.state,
    q.reason_codes,
    q.missing_fields,
    q.verification_requirements
    into
      v_latest_qualification_id,
      v_latest_state,
      v_reason_codes,
      v_missing_fields,
      v_verification_requirements
  from public.prospect_qualifications q
  where q.orientation_id = p_orientation_id
  order by q.created_at desc, q.id desc
  limit 1
  for update;

  if not found
    or v_latest_qualification_id is distinct from p_expected_latest_qualification_id
    or v_latest_state <> 'ready_for_review'::public.prospect_qualification_state
  then
    return null;
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = v_user_id
  for update;

  if not found or v_access_status <> 'prospect_account'::public.customer_lifecycle_status then
    return null;
  end if;

  insert into public.prospect_qualifications (
    orientation_id,
    engine_version,
    state,
    reason_codes,
    missing_fields,
    verification_requirements,
    next_action,
    origin,
    reviewer_user_id,
    review_reason,
    supersedes_id
  )
  values (
    p_orientation_id,
    'prospect-qualification-v1',
    p_decision,
    case
      when p_decision = 'qualified_prospect'::public.prospect_qualification_state
        then array['ready_for_human_review']::text[]
      else coalesce(v_reason_codes, '{}'::text[])
    end,
    case
      when p_decision = 'qualified_prospect'::public.prospect_qualification_state
        then '{}'::text[]
      else coalesce(v_missing_fields, '{}'::text[])
    end,
    coalesce(v_verification_requirements, '{}'::text[]),
    case
      when p_decision = 'needs_verification'::public.prospect_qualification_state
        then 'resolve_project_verification'
      else null
    end,
    'human_review'::public.prospect_qualification_origin,
    p_admin_user_id,
    btrim(p_review_reason),
    v_latest_qualification_id
  )
  returning id into v_new_qualification_id;

  if p_decision = 'qualified_prospect'::public.prospect_qualification_state then
    update public.customer_access
      set
        status = 'qualified_prospect'::public.customer_lifecycle_status,
        status_changed_at = now(),
        updated_at = now()
    where user_id = v_user_id
      and status = 'prospect_account'::public.customer_lifecycle_status;

    if not found then
      raise exception 'qualification access transition lost concurrency race';
    end if;
  end if;

  return v_new_qualification_id;
end;
$$;

revoke execute on function public.review_phase2_prospect_qualification(
  uuid,
  uuid,
  uuid,
  public.prospect_qualification_state,
  text
) from public, anon, authenticated;

grant execute on function public.review_phase2_prospect_qualification(
  uuid,
  uuid,
  uuid,
  public.prospect_qualification_state,
  text
) to service_role;
