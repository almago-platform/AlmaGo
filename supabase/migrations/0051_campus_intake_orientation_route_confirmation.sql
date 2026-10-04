-- Focused Campus Allemagne intake flow:
-- orientation -> starter evidence -> Campus review -> proposed route -> student confirmation -> procedure.
-- This migration deliberately stops before downstream procedure execution.

create table if not exists public.student_intake_cases (
  student_id uuid primary key references auth.users(id) on delete cascade,
  orientation_id uuid not null references public.orientations(id) on delete restrict,
  status text not null default 'starter_documents' check (status in (
    'starter_documents',
    'campus_review',
    'route_proposed',
    'student_question',
    'procedure_created'
  )),
  orientation_confirmed_at timestamptz not null,
  proposed_route_key text check (
    proposed_route_key is null
    or proposed_route_key in (
      'studies_bachelor',
      'studies_master',
      'study_preparation',
      'study_place_search',
      'standalone_language'
    )
  ),
  proposal_reason text,
  proposed_by uuid references auth.users(id) on delete set null,
  proposed_at timestamptz,
  student_response text check (
    student_response is null or student_response in ('confirmed', 'discussion_requested')
  ),
  student_response_note text,
  student_responded_at timestamptz,
  procedure_id uuid references public.student_procedures(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    proposed_route_key is null
    or (
      proposal_reason is not null
      and char_length(btrim(proposal_reason)) > 0
      and proposed_by is not null
      and proposed_at is not null
    )
  ),
  check (
    status <> 'procedure_created'
    or (
      student_response = 'confirmed'
      and procedure_id is not null
    )
  )
);

create index if not exists student_intake_cases_status_idx
  on public.student_intake_cases(status, updated_at desc);

alter table public.student_intake_cases enable row level security;

drop policy if exists "student intake own or admin read" on public.student_intake_cases;
create policy "student intake own or admin read"
  on public.student_intake_cases
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
  );

revoke all on table public.student_intake_cases from anon;
revoke insert, update, delete on table public.student_intake_cases from authenticated;
grant select on table public.student_intake_cases to authenticated;

create or replace function private.intake_has_approved_starter_documents(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1 from public.documents
      where student_id = p_student_id
        and category = 'passport'
        and status = 'approved'
    )
    and exists (
      select 1 from public.documents
      where student_id = p_student_id
        and category = 'baccalaureate'
        and status = 'approved'
    )
    and exists (
      select 1 from public.documents
      where student_id = p_student_id
        and category = 'transcripts'
        and status = 'approved'
    );
$$;

revoke all on function private.intake_has_approved_starter_documents(uuid)
  from public, anon, authenticated;

create or replace function private.sync_student_intake_document_state()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  target_student_id uuid;
  ready boolean;
begin
  target_student_id := coalesce(new.student_id, old.student_id);

  if target_student_id is null then
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
      student_response = null,
      student_response_note = null,
      student_responded_at = null,
      updated_at = now()
    where student_id = target_student_id
      and status in ('campus_review', 'route_proposed', 'student_question');
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists documents_sync_student_intake on public.documents;
create trigger documents_sync_student_intake
  after insert or update of status, category or delete on public.documents
  for each row execute procedure private.sync_student_intake_document_state();

revoke all on function private.sync_student_intake_document_state()
  from public, anon, authenticated;

create or replace function public.service_claim_prospect_by_verified_email(
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
  v_linked_user_id uuid;
begin
  if p_user_id is null
    or p_user_email is null
    or char_length(btrim(p_user_email)) < 3
  then
    return null;
  end if;

  if not exists (
    select 1
    from auth.users u
    where u.id = p_user_id
      and u.email is not null
      and u.email_confirmed_at is not null
      and lower(u.email) = lower(btrim(p_user_email))
  ) then
    return null;
  end if;

  select p.id, p.user_id
  into v_prospect_id, v_linked_user_id
  from public.prospects p
  where lower(p.email) = lower(btrim(p_user_email))
  limit 1
  for update;

  if not found then
    return null;
  end if;

  if v_linked_user_id is not null and v_linked_user_id <> p_user_id then
    return null;
  end if;

  if exists (
    select 1
    from public.prospects other
    where other.user_id = p_user_id
      and other.id <> v_prospect_id
  ) then
    return null;
  end if;

  update public.prospects
  set user_id = p_user_id, updated_at = now()
  where id = v_prospect_id
    and (user_id is null or user_id = p_user_id);

  insert into public.customer_access (user_id, status)
  values (p_user_id, 'prospect_account')
  on conflict (user_id) do nothing;

  return v_prospect_id;
end;
$$;

revoke all on function public.service_claim_prospect_by_verified_email(uuid, text)
  from public, anon, authenticated;
grant execute on function public.service_claim_prospect_by_verified_email(uuid, text)
  to service_role;

create or replace function public.service_confirm_student_orientation(
  p_user_id uuid,
  p_orientation_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_orientation_id uuid;
begin
  if p_user_id is null or p_orientation_id is null then
    return null;
  end if;

  select o.id
  into v_orientation_id
  from public.orientations o
  join public.prospects p on p.id = o.prospect_id
  where o.id = p_orientation_id
    and p.user_id = p_user_id
  for update of o;

  if not found then
    return null;
  end if;

  if exists (
    select 1 from public.student_intake_cases
    where student_id = p_user_id
      and status = 'procedure_created'
  ) then
    raise exception 'procedure_already_created';
  end if;

  insert into public.student_intake_cases (
    student_id,
    orientation_id,
    status,
    orientation_confirmed_at
  )
  values (
    p_user_id,
    v_orientation_id,
    case
      when private.intake_has_approved_starter_documents(p_user_id) then 'campus_review'
      else 'starter_documents'
    end,
    now()
  )
  on conflict (student_id) do update set
    orientation_id = excluded.orientation_id,
    status = excluded.status,
    orientation_confirmed_at = excluded.orientation_confirmed_at,
    proposed_route_key = null,
    proposal_reason = null,
    proposed_by = null,
    proposed_at = null,
    student_response = null,
    student_response_note = null,
    student_responded_at = null,
    procedure_id = null,
    updated_at = now();

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
    'orientation_confirmed',
    'Votre orientation a été confirmée pour démarrer la vérification du dossier.',
    jsonb_build_object('orientation_id', v_orientation_id)
  );

  return v_orientation_id;
end;
$$;

revoke all on function public.service_confirm_student_orientation(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.service_confirm_student_orientation(uuid, uuid)
  to service_role;

create or replace function public.service_recover_and_confirm_latest_orientation(
  p_user_id uuid,
  p_user_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prospect_id uuid;
  v_orientation_id uuid;
begin
  v_prospect_id := public.service_claim_prospect_by_verified_email(p_user_id, p_user_email);
  if v_prospect_id is null then
    return null;
  end if;

  select id
  into v_orientation_id
  from public.orientations
  where prospect_id = v_prospect_id
    and engine_version = 'public-orientation-v1'
  order by created_at desc, id desc
  limit 1;

  if not found then
    return null;
  end if;

  return public.service_confirm_student_orientation(p_user_id, v_orientation_id);
end;
$$;

revoke all on function public.service_recover_and_confirm_latest_orientation(uuid, text)
  from public, anon, authenticated;
grant execute on function public.service_recover_and_confirm_latest_orientation(uuid, text)
  to service_role;

create or replace function public.service_admin_propose_student_route(
  p_admin_id uuid,
  p_student_id uuid,
  p_route_key text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.student_intake_cases%rowtype;
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

  select *
  into v_case
  from public.student_intake_cases
  where student_id = p_student_id
  for update;

  if not found then
    raise exception 'intake_case_not_found';
  end if;

  if v_case.status = 'procedure_created' then
    raise exception 'procedure_already_created';
  end if;

  if not private.intake_has_approved_starter_documents(p_student_id) then
    raise exception 'starter_documents_not_approved';
  end if;

  update public.student_intake_cases
  set
    status = 'route_proposed',
    proposed_route_key = p_route_key,
    proposal_reason = btrim(p_reason),
    proposed_by = p_admin_id,
    proposed_at = now(),
    student_response = null,
    student_response_note = null,
    student_responded_at = null,
    updated_at = now()
  where student_id = p_student_id;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    p_student_id,
    'campus_route_proposed',
    'Parcours proposé par Campus Allemagne',
    'Campus Allemagne a terminé la première vérification de votre dossier. Consultez la proposition dans votre espace.',
    jsonb_build_object('route_key', p_route_key)
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
    'Campus Allemagne a proposé un parcours après vérification des pièces de départ.',
    jsonb_build_object('route_key', p_route_key, 'reason', btrim(p_reason))
  );
end;
$$;

revoke all on function public.service_admin_propose_student_route(uuid, uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.service_admin_propose_student_route(uuid, uuid, text, text)
  to service_role;

create or replace function public.service_student_request_route_discussion(
  p_user_id uuid,
  p_note text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_case public.student_intake_cases%rowtype;
begin
  select *
  into v_case
  from public.student_intake_cases
  where student_id = p_user_id
  for update;

  if not found or v_case.status <> 'route_proposed' then
    raise exception 'route_proposal_not_available';
  end if;

  update public.student_intake_cases
  set
    status = 'student_question',
    student_response = 'discussion_requested',
    student_response_note = nullif(btrim(p_note), ''),
    student_responded_at = now(),
    updated_at = now()
  where student_id = p_user_id;

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
    'campus_route_discussion_requested',
    'Vous avez demandé à discuter du parcours proposé avant de le confirmer.',
    jsonb_build_object('note', nullif(btrim(p_note), ''))
  );
end;
$$;

revoke all on function public.service_student_request_route_discussion(uuid, text)
  from public, anon, authenticated;
grant execute on function public.service_student_request_route_discussion(uuid, text)
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
  v_orientation public.orientations%rowtype;
  v_answers jsonb;
  v_project_path public.student_project_path;
  v_target_intake text;
  v_procedure_id uuid;
begin
  select *
  into v_case
  from public.student_intake_cases
  where student_id = p_user_id
  for update;

  if not found or v_case.status <> 'route_proposed' or v_case.proposed_route_key is null then
    raise exception 'route_proposal_not_available';
  end if;

  if not private.intake_has_approved_starter_documents(p_user_id) then
    raise exception 'starter_documents_not_approved';
  end if;

  select *
  into v_orientation
  from public.orientations
  where id = v_case.orientation_id;

  if not found then
    raise exception 'orientation_not_found';
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
    raise exception 'unsupported_route';
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
    p_user_id,
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
    p_user_id,
    v_case.proposed_route_key,
    v_case.proposed_by
  );

  update public.student_intake_cases
  set
    status = 'procedure_created',
    student_response = 'confirmed',
    student_response_note = null,
    student_responded_at = now(),
    procedure_id = v_procedure_id,
    updated_at = now()
  where student_id = p_user_id;

  insert into public.notifications (user_id, type, title, body, metadata)
  values (
    p_user_id,
    'campus_route_confirmed',
    'Parcours confirmé',
    'Votre parcours a été confirmé et votre procédure Campus Allemagne a été créée.',
    jsonb_build_object(
      'route_key', v_case.proposed_route_key,
      'procedure_id', v_procedure_id
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
    'campus_route_confirmed',
    'Vous avez confirmé le parcours proposé par Campus Allemagne.',
    jsonb_build_object(
      'route_key', v_case.proposed_route_key,
      'procedure_id', v_procedure_id
    )
  );

  return v_procedure_id;
end;
$$;

revoke all on function public.service_confirm_proposed_route(uuid)
  from public, anon, authenticated;
grant execute on function public.service_confirm_proposed_route(uuid)
  to service_role;
