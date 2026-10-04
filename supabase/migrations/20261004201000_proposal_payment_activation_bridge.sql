-- Bridge Campus route proposals to commercial payment and post-payment activation.
-- Student acceptance no longer creates the client procedure. The procedure is created
-- only after a successful payment has been recorded and an admin validates it.

alter table public.student_intake_cases
  add column if not exists proposed_offer_version_id uuid
    references public.commercial_offer_versions(id) on delete restrict,
  add column if not exists purchase_id uuid
    references public.commercial_purchases(id) on delete restrict,
  add column if not exists accepted_at timestamptz,
  add column if not exists payment_validated_at timestamptz;

alter table public.student_intake_cases
  drop constraint if exists student_intake_cases_status_check;

alter table public.student_intake_cases
  add constraint student_intake_cases_status_check
  check (status in (
    'starter_documents',
    'campus_review',
    'route_proposed',
    'student_question',
    'payment_pending',
    'paid_pending_validation',
    'procedure_created'
  ));

alter table public.student_intake_cases
  drop constraint if exists student_intake_cases_check1;

alter table public.student_intake_cases
  add constraint student_intake_cases_procedure_payment_check
  check (
    status <> 'procedure_created'
    or (
      student_response = 'confirmed'
      and procedure_id is not null
      and purchase_id is not null
      and payment_validated_at is not null
    )
  );

create index if not exists student_intake_cases_purchase_idx
  on public.student_intake_cases(purchase_id)
  where purchase_id is not null;

create or replace function private.sync_student_intake_document_state()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  target_student_id uuid;
  ready boolean;
  pre_bac boolean;
begin
  target_student_id := coalesce(new.student_id, old.student_id);

  if target_student_id is null then
    return coalesce(new, old);
  end if;

  select coalesce(o.input -> 'answers' ->> 'bacStatus', '') = 'preparing'
    into pre_bac
  from public.student_intake_cases sic
  join public.orientations o on o.id = sic.orientation_id
  where sic.student_id = target_student_id;

  if coalesce(pre_bac, false) then
    return coalesce(new, old);
  end if;

  select private.intake_has_approved_starter_documents(target_student_id)
    into ready;

  if ready then
    update public.student_intake_cases
    set
      status = case
        when status = 'starter_documents' then 'campus_review'
        else status
      end,
      updated_at = now()
    where student_id = target_student_id
      and status in ('starter_documents', 'campus_review');
  else
    update public.student_intake_cases
    set
      status = 'starter_documents',
      proposed_route_key = null,
      proposal_reason = null,
      proposed_by = null,
      proposed_at = null,
      proposed_offer_version_id = null,
      purchase_id = null,
      student_response = null,
      student_response_note = null,
      student_responded_at = null,
      accepted_at = null,
      payment_validated_at = null,
      updated_at = now()
    where student_id = target_student_id
      and status in ('campus_review', 'route_proposed', 'student_question');
  end if;

  return coalesce(new, old);
end;
$$;

revoke execute on function public.service_admin_propose_student_route(uuid, uuid, text, text)
  from service_role;

create or replace function public.service_admin_propose_student_route(
  p_admin_id uuid,
  p_student_id uuid,
  p_route_key text,
  p_reason text,
  p_offer_version_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_case public.student_intake_cases%rowtype;
  v_pre_bac boolean;
  v_access_status public.customer_lifecycle_status;
begin
  if not exists (
    select 1
    from public.user_roles
    where user_id = p_admin_id
      and role = 'admin'
  ) then
    raise exception 'admin_required';
  end if;

  if p_route_key not in (
    'studies_bachelor',
    'studies_master',
    'study_preparation',
    'study_place_search',
    'standalone_language'
  ) then
    raise exception 'unsupported_route';
  end if;

  if coalesce(char_length(btrim(p_reason)), 0) < 3 then
    raise exception 'proposal_reason_required';
  end if;

  if p_offer_version_id is null or not exists (
    select 1
    from public.commercial_offer_versions v
    where v.id = p_offer_version_id
      and v.status = 'published'::public.commercial_offer_version_status
      and v.price_minor is not null
      and v.currency is not null
  ) then
    raise exception 'published_offer_required';
  end if;

  select *
    into v_case
  from public.student_intake_cases
  where student_id = p_student_id
  for update;

  if not found then
    raise exception 'intake_case_not_found';
  end if;

  if v_case.status in ('payment_pending', 'paid_pending_validation', 'procedure_created') then
    raise exception 'commercial_flow_already_started';
  end if;

  select coalesce(o.input -> 'answers' ->> 'bacStatus', '') = 'preparing'
    into v_pre_bac
  from public.orientations o
  where o.id = v_case.orientation_id;

  if coalesce(v_pre_bac, false) then
    if p_route_key not in ('study_preparation', 'standalone_language') then
      raise exception 'pre_bac_route_not_supported';
    end if;
  elsif not private.intake_has_approved_starter_documents(p_student_id) then
    raise exception 'starter_documents_not_approved';
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = p_student_id;

  if v_access_status in (
    'payment_pending'::public.customer_lifecycle_status,
    'paid_pending_validation'::public.customer_lifecycle_status,
    'client_active'::public.customer_lifecycle_status,
    'client_completed'::public.customer_lifecycle_status
  ) then
    raise exception 'commercial_access_not_proposable';
  end if;

  update public.student_intake_cases
  set
    status = 'route_proposed',
    proposed_route_key = p_route_key,
    proposal_reason = btrim(p_reason),
    proposed_by = p_admin_id,
    proposed_at = now(),
    proposed_offer_version_id = p_offer_version_id,
    purchase_id = null,
    student_response = null,
    student_response_note = null,
    student_responded_at = null,
    accepted_at = null,
    payment_validated_at = null,
    procedure_id = null,
    updated_at = now()
  where student_id = p_student_id;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    p_student_id,
    'campus_route_proposed',
    'Proposition Campus Allemagne disponible',
    'Campus Allemagne vous a envoyé une proposition de parcours et d’accompagnement. Consultez-la dans votre espace.',
    jsonb_build_object(
      'route_key', p_route_key,
      'offer_version_id', p_offer_version_id
    )
  );

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    p_student_id,
    p_admin_id,
    'campus_route_proposed',
    'Campus Allemagne a envoyé une proposition de parcours et d’accompagnement.',
    jsonb_build_object(
      'route_key', p_route_key,
      'reason', btrim(p_reason),
      'offer_version_id', p_offer_version_id
    )
  );
end;
$$;

revoke all on function public.service_admin_propose_student_route(uuid, uuid, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.service_admin_propose_student_route(uuid, uuid, text, text, uuid)
  to service_role;

create or replace function public.service_confirm_proposed_route(
  p_user_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_case public.student_intake_cases%rowtype;
  v_pre_bac boolean;
  v_access_status public.customer_lifecycle_status;
  v_purchase_id uuid;
begin
  select *
    into v_case
  from public.student_intake_cases
  where student_id = p_user_id
  for update;

  if not found
    or v_case.status <> 'route_proposed'
    or v_case.proposed_route_key is null
    or v_case.proposed_offer_version_id is null
  then
    raise exception 'route_proposal_not_available';
  end if;

  select coalesce(o.input -> 'answers' ->> 'bacStatus', '') = 'preparing'
    into v_pre_bac
  from public.orientations o
  where o.id = v_case.orientation_id;

  if coalesce(v_pre_bac, false) then
    if v_case.proposed_route_key not in ('study_preparation', 'standalone_language') then
      raise exception 'pre_bac_route_not_supported';
    end if;
  elsif not private.intake_has_approved_starter_documents(p_user_id) then
    raise exception 'starter_documents_not_approved';
  end if;

  insert into public.customer_access (user_id, status)
  values (p_user_id, 'prospect_account'::public.customer_lifecycle_status)
  on conflict (user_id) do nothing;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = p_user_id
  for update;

  if v_access_status = 'prospect_account'::public.customer_lifecycle_status then
    update public.customer_access
    set
      status = 'qualified_prospect'::public.customer_lifecycle_status,
      status_changed_at = now(),
      updated_at = now()
    where user_id = p_user_id
      and status = 'prospect_account'::public.customer_lifecycle_status;

    insert into public.customer_access_events (
      user_id,
      previous_status,
      next_status,
      source
    )
    values (
      p_user_id,
      'prospect_account'::public.customer_lifecycle_status,
      'qualified_prospect'::public.customer_lifecycle_status,
      'campus_proposal_accepted'
    );

    v_access_status := 'qualified_prospect'::public.customer_lifecycle_status;
  end if;

  if v_access_status not in (
    'qualified_prospect'::public.customer_lifecycle_status,
    'payment_pending'::public.customer_lifecycle_status
  ) then
    raise exception 'commercial_access_not_payable';
  end if;

  v_purchase_id := public.begin_phase2_commercial_purchase(
    p_user_id,
    v_case.proposed_offer_version_id
  );

  if v_purchase_id is null then
    raise exception 'purchase_creation_failed';
  end if;

  update public.student_intake_cases
  set
    status = 'payment_pending',
    student_response = 'confirmed',
    student_response_note = null,
    student_responded_at = now(),
    accepted_at = now(),
    purchase_id = v_purchase_id,
    updated_at = now()
  where student_id = p_user_id;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    p_user_id,
    'campus_route_accepted',
    'Proposition acceptée',
    'Votre proposition est acceptée. Le paiement doit maintenant être finalisé avant l’ouverture de la phase suivante.',
    jsonb_build_object(
      'route_key', v_case.proposed_route_key,
      'purchase_id', v_purchase_id
    )
  );

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    p_user_id,
    p_user_id,
    'campus_route_accepted',
    'Vous avez accepté la proposition Campus Allemagne. La phase suivante reste verrouillée jusqu’à validation du paiement.',
    jsonb_build_object(
      'route_key', v_case.proposed_route_key,
      'purchase_id', v_purchase_id
    )
  );

  return v_purchase_id;
end;
$$;

create or replace function private.sync_student_intake_purchase_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if new.status = 'paid_pending_validation'::public.commercial_purchase_status then
    update public.student_intake_cases
    set status = 'paid_pending_validation', updated_at = now()
    where purchase_id = new.id
      and status = 'payment_pending';
  elsif new.status in (
    'cancelled'::public.commercial_purchase_status,
    'refunded'::public.commercial_purchase_status
  ) then
    update public.student_intake_cases
    set
      status = 'route_proposed',
      purchase_id = null,
      student_response = null,
      student_response_note = null,
      student_responded_at = null,
      accepted_at = null,
      updated_at = now()
    where purchase_id = new.id
      and status in ('payment_pending', 'paid_pending_validation');
  end if;

  return new;
end;
$$;

drop trigger if exists commercial_purchase_sync_student_intake
  on public.commercial_purchases;
create trigger commercial_purchase_sync_student_intake
  after update of status on public.commercial_purchases
  for each row execute procedure private.sync_student_intake_purchase_state();

revoke all on function private.sync_student_intake_purchase_state()
  from public, anon, authenticated;

create or replace function private.guard_student_intake_commercial_orientation_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status in ('payment_pending', 'paid_pending_validation')
    and new.orientation_id is distinct from old.orientation_id
  then
    raise exception 'commercial_flow_orientation_locked';
  end if;

  -- Older orientation-refresh functions know only the original intake columns.
  -- When they clear the route, clear the newly-added commercial linkage too so
  -- a replaced orientation can never inherit a stale offer or purchase.
  if new.proposed_route_key is null then
    new.proposed_offer_version_id := null;
    new.purchase_id := null;
    new.accepted_at := null;
    new.payment_validated_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists student_intake_commercial_orientation_guard
  on public.student_intake_cases;
create trigger student_intake_commercial_orientation_guard
  before update on public.student_intake_cases
  for each row execute procedure private.guard_student_intake_commercial_orientation_change();

revoke all on function private.guard_student_intake_commercial_orientation_change()
  from public, anon, authenticated;

create or replace function public.activate_phase2_paid_purchase(
  p_admin_user_id uuid,
  p_purchase_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_purchase_status public.commercial_purchase_status;
  v_amount_minor bigint;
  v_currency text;
  v_access_status public.customer_lifecycle_status;
  v_case public.student_intake_cases%rowtype;
  v_orientation public.orientations%rowtype;
  v_answers jsonb;
  v_project_path public.student_project_path;
  v_target_intake text;
  v_procedure_id uuid;
begin
  if p_admin_user_id is null or p_purchase_id is null then
    return false;
  end if;

  if not exists (
    select 1
    from public.user_roles ur
    where ur.user_id = p_admin_user_id
      and ur.role = 'admin'
  ) then
    return false;
  end if;

  select p.user_id, p.status, p.amount_minor, p.currency
    into v_user_id, v_purchase_status, v_amount_minor, v_currency
  from public.commercial_purchases p
  where p.id = p_purchase_id
  for update;

  if not found then
    return false;
  end if;

  select *
    into v_case
  from public.student_intake_cases sic
  where sic.student_id = v_user_id
  for update;

  if not found
    or v_case.purchase_id is distinct from p_purchase_id
    or v_case.proposed_route_key is null
    or v_case.student_response <> 'confirmed'
  then
    return false;
  end if;

  select ca.status
    into v_access_status
  from public.customer_access ca
  where ca.user_id = v_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_purchase_status = 'client_active'::public.commercial_purchase_status
    and v_access_status in (
      'client_active'::public.customer_lifecycle_status,
      'client_completed'::public.customer_lifecycle_status
    )
    and v_case.status = 'procedure_created'
    and v_case.procedure_id is not null
  then
    return true;
  end if;

  if v_purchase_status <> 'paid_pending_validation'::public.commercial_purchase_status
    or v_access_status <> 'paid_pending_validation'::public.customer_lifecycle_status
    or v_case.status <> 'paid_pending_validation'
  then
    return false;
  end if;

  if not exists (
    select 1
    from public.payment_transactions t
    join public.payment_attempts a on a.id = t.attempt_id
    where a.purchase_id = p_purchase_id
      and t.kind = 'charge'::public.payment_transaction_kind
      and t.status = 'succeeded'::public.payment_transaction_status
      and t.amount_minor = v_amount_minor
      and t.currency = v_currency
  ) then
    return false;
  end if;

  select *
    into v_orientation
  from public.orientations o
  where o.id = v_case.orientation_id;

  if not found then
    return false;
  end if;

  v_answers := coalesce(v_orientation.input -> 'answers', '{}'::jsonb);

  v_project_path := case v_case.proposed_route_key
    when 'study_preparation' then 'german_preparation_and_studies'::public.student_project_path
    when 'studies_master' then 'master_and_language'::public.student_project_path
    when 'standalone_language' then 'language_only'::public.student_project_path
    when 'studies_bachelor' then 'university_search'::public.student_project_path
    when 'study_place_search' then 'university_search'::public.student_project_path
    else null
  end;

  if v_project_path is null then
    return false;
  end if;

  v_target_intake := nullif(
    concat_ws(
      '-',
      nullif(v_answers ->> 'targetIntakeSeason', ''),
      nullif(v_answers ->> 'targetIntakeYear', '')
    ),
    ''
  );

  insert into public.student_projects (
    student_id,
    path,
    target_degree,
    target_field,
    target_intake,
    preferred_cities,
    current_german_level,
    updated_at
  )
  values (
    v_user_id,
    v_project_path,
    nullif(v_answers ->> 'targetDegree', ''),
    nullif(v_answers ->> 'targetField', ''),
    v_target_intake,
    case
      when jsonb_typeof(v_answers -> 'preferredCities') = 'array'
        then array(select jsonb_array_elements_text(v_answers -> 'preferredCities'))
      else '{}'::text[]
    end,
    nullif(v_answers ->> 'germanLevel', ''),
    now()
  )
  on conflict (student_id) do update set
    path = excluded.path,
    target_degree = excluded.target_degree,
    target_field = excluded.target_field,
    target_intake = excluded.target_intake,
    preferred_cities = excluded.preferred_cities,
    current_german_level = excluded.current_german_level,
    updated_at = now();

  v_procedure_id := private.create_campus_student_procedure_for_route(
    v_user_id,
    v_case.proposed_route_key,
    v_case.proposed_by
  );

  if v_procedure_id is null then
    raise exception 'procedure_creation_failed';
  end if;

  update public.commercial_purchases
  set status = 'client_active'::public.commercial_purchase_status,
      updated_at = now()
  where id = p_purchase_id
    and status = 'paid_pending_validation'::public.commercial_purchase_status;

  if not found then
    raise exception 'purchase_activation_conflict';
  end if;

  update public.customer_access
  set status = 'client_active'::public.customer_lifecycle_status,
      status_changed_at = now(),
      updated_at = now()
  where user_id = v_user_id
    and status = 'paid_pending_validation'::public.customer_lifecycle_status;

  if not found then
    raise exception 'access_activation_conflict';
  end if;

  insert into public.customer_access_events (
    user_id,
    previous_status,
    next_status,
    source,
    purchase_id
  )
  values (
    v_user_id,
    'paid_pending_validation'::public.customer_lifecycle_status,
    'client_active'::public.customer_lifecycle_status,
    'admin_payment_validation',
    p_purchase_id
  );

  update public.student_intake_cases
  set
    status = 'procedure_created',
    procedure_id = v_procedure_id,
    payment_validated_at = now(),
    updated_at = now()
  where student_id = v_user_id;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    v_user_id,
    'campus_payment_validated',
    'Paiement validé · espace activé',
    'Votre paiement a été validé. Votre espace client et la phase suivante sont maintenant disponibles.',
    jsonb_build_object(
      'purchase_id', p_purchase_id,
      'procedure_id', v_procedure_id,
      'route_key', v_case.proposed_route_key
    )
  );

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    v_user_id,
    p_admin_user_id,
    'campus_payment_validated',
    'Campus Allemagne a validé le paiement et activé la phase suivante.',
    jsonb_build_object(
      'purchase_id', p_purchase_id,
      'procedure_id', v_procedure_id,
      'route_key', v_case.proposed_route_key
    )
  );

  return true;
end;
$$;
