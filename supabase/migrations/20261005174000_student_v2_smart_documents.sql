-- Campus Allemagne P3: smart document requirements with minimum student burden.
-- Depends on P1/P2. Reuses public.documents and student_history; it does not create a second file store.

create or replace function private.campus_requirement_status_for_document(p_status public.document_status)
returns text
language sql
immutable
set search_path = public, private
as $$
  select case p_status::text
    when 'approved' then 'accepted_original'
    when 'replace_required' then 'replacement_required'
    when 'rejected' then 'replacement_required'
    when 'quarantined' then 'replacement_required'
    when 'reviewed' then 'under_review'
    else 'uploaded'
  end;
$$;

create or replace function private.seed_campus_starter_requirements(p_student_procedure_id uuid)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
declare
  procedure_record public.student_procedures%rowtype;
  requirement_record public.student_document_requirements%rowtype;
  document_record public.documents%rowtype;
begin
  select *
  into procedure_record
  from public.student_procedures
  where id = p_student_procedure_id;

  if not found then
    raise exception 'student_procedure_not_found';
  end if;

  insert into public.student_document_requirements (
    student_id,
    student_procedure_id,
    requirement_key,
    label,
    category,
    status,
    required_for,
    requested_from_student,
    student_request_reason,
    requires_tunisian_authentication,
    requires_translation,
    requires_german_legalisation,
    legalisation_status,
    created_by
  )
  values
    (
      procedure_record.student_id,
      procedure_record.id,
      'passport',
      'Passeport',
      'passport',
      'requested',
      array['starter_documents']::text[],
      true,
      'La page d’identité du passeport est une pièce de départ indispensable au dossier.',
      false,
      false,
      null,
      'to_verify',
      auth.uid()
    ),
    (
      procedure_record.student_id,
      procedure_record.id,
      'baccalaureate',
      'Bac / preuve officielle du Bac',
      'baccalaureate',
      'requested',
      array['starter_documents','academic_eligibility']::text[],
      true,
      'Le Bac ou sa preuve officielle est une pièce académique de départ indispensable.',
      false,
      false,
      null,
      'to_verify',
      auth.uid()
    ),
    (
      procedure_record.student_id,
      procedure_record.id,
      'baccalaureate_transcript',
      'Relevé de notes du Bac',
      'transcripts',
      'requested',
      array['starter_documents','academic_eligibility']::text[],
      true,
      'Le relevé de notes du Bac est une pièce académique de départ indispensable.',
      false,
      false,
      null,
      'to_verify',
      auth.uid()
    ),
    (
      procedure_record.student_id,
      procedure_record.id,
      'existing_language_certificate',
      'Certificat de langue existant',
      'language_certificate',
      'not_applicable',
      array['language_path']::text[],
      false,
      null,
      false,
      false,
      null,
      'to_verify',
      auth.uid()
    )
  on conflict (student_procedure_id, requirement_key) do nothing;

  for requirement_record in
    select *
    from public.student_document_requirements
    where student_procedure_id = procedure_record.id
      and requirement_key in (
        'passport',
        'baccalaureate',
        'baccalaureate_transcript',
        'existing_language_certificate'
      )
  loop
    select *
    into document_record
    from public.documents
    where student_id = procedure_record.student_id
      and category = requirement_record.category
    order by created_at desc
    limit 1;

    if found then
      update public.student_document_requirements
      set
        document_id = document_record.id,
        status = private.campus_requirement_status_for_document(document_record.status),
        updated_at = now()
      where id = requirement_record.id;
    end if;
  end loop;
end;
$$;

create or replace function private.seed_campus_starter_requirements_trigger()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if new.is_current then
    perform private.seed_campus_starter_requirements(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists student_procedures_seed_starter_requirements on public.student_procedures;
create trigger student_procedures_seed_starter_requirements
  after insert on public.student_procedures
  for each row execute procedure private.seed_campus_starter_requirements_trigger();

select private.seed_campus_starter_requirements(id)
from public.student_procedures
where is_current;

create or replace function private.sync_campus_document_requirement()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  requirement_record public.student_document_requirements%rowtype;
begin
  if tg_op = 'DELETE' then
    for requirement_record in
      select *
      from public.student_document_requirements
      where document_id = old.id
    loop
      update public.student_document_requirements
      set
        document_id = null,
        status = case
          when requirement_record.requirement_key = 'existing_language_certificate'
            then 'not_applicable'
          else 'requested'
        end,
        updated_at = now()
      where id = requirement_record.id;
    end loop;

    return old;
  end if;

  select requirement.*
  into requirement_record
  from public.student_document_requirements requirement
  join public.student_procedures procedure
    on procedure.id = requirement.student_procedure_id
   and procedure.is_current
  where requirement.student_id = new.student_id
    and requirement.category = new.category
    and (
      requirement.document_id = new.id
      or requirement.document_id is null
      or requirement.status in ('requested', 'replacement_required', 'not_applicable')
    )
  order by
    case
      when requirement.document_id = new.id then 0
      when requirement.requirement_key in (
        'passport',
        'baccalaureate',
        'baccalaureate_transcript',
        'existing_language_certificate'
      ) then 1
      else 2
    end,
    requirement.created_at
  limit 1
  for update of requirement;

  if not found then
    return new;
  end if;

  update public.student_document_requirements
  set
    document_id = new.id,
    status = private.campus_requirement_status_for_document(new.status),
    updated_at = now()
  where id = requirement_record.id;

  return new;
end;
$$;

drop trigger if exists documents_sync_campus_requirement on public.documents;
create trigger documents_sync_campus_requirement
  after insert or update of status, category on public.documents
  for each row execute procedure private.sync_campus_document_requirement();

drop trigger if exists documents_reset_campus_requirement_before_delete on public.documents;
create trigger documents_reset_campus_requirement_before_delete
  before delete on public.documents
  for each row execute procedure private.sync_campus_document_requirement();

create or replace function public.admin_request_student_document(
  p_student_id uuid,
  p_requirement_key text,
  p_label text,
  p_category text,
  p_reason text,
  p_due_date date default null,
  p_required_for text[] default '{}'::text[]
)
returns uuid
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  procedure_record public.student_procedures%rowtype;
  requirement_id uuid;
  normalized_key text := btrim(coalesce(p_requirement_key, ''));
  normalized_label text := btrim(coalesce(p_label, ''));
  normalized_reason text := btrim(coalesce(p_reason, ''));
begin
  if not public.is_admin() then
    raise exception 'Admin privileges required';
  end if;

  if normalized_key = ''
    or normalized_label = ''
    or normalized_reason = ''
  then
    raise exception 'requirement_key_label_and_reason_required';
  end if;

  if normalized_key in (
    'passport',
    'baccalaureate',
    'baccalaureate_transcript',
    'existing_language_certificate'
  ) then
    raise exception 'starter_requirement_is_managed_automatically';
  end if;

  if p_category not in (
    'passport',
    'baccalaureate',
    'transcripts',
    'language_certificate',
    'university_attestation',
    'cv',
    'motivation_letter',
    'translation',
    'admission',
    'other'
  ) then
    raise exception 'invalid_document_category';
  end if;

  select *
  into procedure_record
  from public.student_procedures
  where student_id = p_student_id
    and is_current
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'current_student_procedure_not_found';
  end if;

  insert into public.student_document_requirements (
    student_id,
    student_procedure_id,
    requirement_key,
    label,
    category,
    status,
    required_for,
    requested_from_student,
    student_request_reason,
    student_request_due_date,
    requires_tunisian_authentication,
    requires_translation,
    requires_german_legalisation,
    legalisation_status,
    created_by
  )
  values (
    p_student_id,
    procedure_record.id,
    normalized_key,
    normalized_label,
    p_category,
    'requested',
    coalesce(p_required_for, '{}'::text[]),
    true,
    normalized_reason,
    p_due_date,
    false,
    false,
    null,
    'to_verify',
    auth.uid()
  )
  on conflict (student_procedure_id, requirement_key) do update set
    label = excluded.label,
    category = excluded.category,
    status = case
      when public.student_document_requirements.status = 'ready'
        then public.student_document_requirements.status
      else 'requested'
    end,
    document_id = case
      when public.student_document_requirements.status = 'ready'
        then public.student_document_requirements.document_id
      else null
    end,
    required_for = excluded.required_for,
    requested_from_student = true,
    student_request_reason = excluded.student_request_reason,
    student_request_due_date = excluded.student_request_due_date,
    updated_at = now()
  returning id into requirement_id;

  return requirement_id;
end;
$$;

revoke all on function private.campus_requirement_status_for_document(public.document_status) from public, anon, authenticated;
revoke all on function private.seed_campus_starter_requirements(uuid) from public, anon, authenticated;
revoke all on function private.seed_campus_starter_requirements_trigger() from public, anon, authenticated;
revoke all on function private.sync_campus_document_requirement() from public, anon, authenticated;

revoke all on function public.admin_request_student_document(uuid, text, text, text, text, date, text[]) from public, anon;
grant execute on function public.admin_request_student_document(uuid, text, text, text, text, date, text[]) to authenticated;
