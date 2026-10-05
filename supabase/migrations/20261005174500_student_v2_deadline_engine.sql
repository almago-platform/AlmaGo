-- Campus Allemagne P4: verified application deadlines and internal target metadata.
-- Extends existing applications; no parallel deadline table is introduced.

alter table public.applications
  add column if not exists application_method text check (
    application_method is null or application_method in (
      'direct',
      'uni_assist',
      'vpd_then_direct',
      'other_documented',
      'unknown'
    )
  ),
  add column if not exists deadline_kind text not null default 'official_hard_deadline' check (
    deadline_kind in (
      'official_hard_deadline',
      'official_external_date',
      'internal_target',
      'source_review_date'
    )
  ),
  add column if not exists deadline_source_url text,
  add column if not exists deadline_verified_at timestamptz,
  add column if not exists deadline_cycle text;

create index if not exists applications_deadline_verification_idx
  on public.applications(deadline, deadline_verified_at)
  where deadline is not null;

create or replace function public.admin_set_application_deadline(
  p_application_id uuid,
  p_deadline date,
  p_deadline_source_url text,
  p_deadline_verified_at timestamptz,
  p_deadline_cycle text,
  p_application_method text default 'unknown'
)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  application_record public.applications%rowtype;
  normalized_source text := btrim(coalesce(p_deadline_source_url, ''));
  normalized_cycle text := btrim(coalesce(p_deadline_cycle, ''));
  normalized_method text := coalesce(nullif(btrim(p_application_method), ''), 'unknown');
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  if p_deadline is null
    or normalized_source = ''
    or normalized_cycle = ''
    or p_deadline_verified_at is null
  then
    raise exception 'deadline_source_verified_at_and_cycle_required';
  end if;

  if normalized_source !~* '^https?://'
    or p_deadline_verified_at > now()
  then
    raise exception 'invalid_deadline_provenance';
  end if;

  if normalized_method not in (
    'direct',
    'uni_assist',
    'vpd_then_direct',
    'other_documented',
    'unknown'
  ) then
    raise exception 'invalid_application_method';
  end if;

  select *
  into application_record
  from public.applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  update public.applications
  set
    deadline = p_deadline,
    deadline_kind = 'official_hard_deadline',
    deadline_source_url = normalized_source,
    deadline_verified_at = p_deadline_verified_at,
    deadline_cycle = normalized_cycle,
    application_method = normalized_method,
    updated_at = now()
  where id = p_application_id;

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    application_record.student_id,
    auth.uid(),
    'application_deadline_verified',
    'Une échéance officielle de candidature a été vérifiée.',
    jsonb_build_object(
      'application_id', p_application_id,
      'deadline', p_deadline,
      'deadline_kind', 'official_hard_deadline',
      'source_url', normalized_source,
      'verified_at', p_deadline_verified_at,
      'cycle', normalized_cycle,
      'application_method', normalized_method
    )
  );
end;
$$;

create or replace function public.admin_mark_application_deadline_to_verify(
  p_application_id uuid,
  p_deadline date default null,
  p_deadline_cycle text default null,
  p_application_method text default 'unknown'
)
returns void
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  application_record public.applications%rowtype;
  normalized_method text := coalesce(nullif(btrim(p_application_method), ''), 'unknown');
begin
  if not public.is_admin() then
    raise exception 'admin_required';
  end if;

  if normalized_method not in (
    'direct',
    'uni_assist',
    'vpd_then_direct',
    'other_documented',
    'unknown'
  ) then
    raise exception 'invalid_application_method';
  end if;

  select *
  into application_record
  from public.applications
  where id = p_application_id
  for update;

  if not found then
    raise exception 'application_not_found';
  end if;

  update public.applications
  set
    deadline = p_deadline,
    deadline_kind = 'official_hard_deadline',
    deadline_source_url = null,
    deadline_verified_at = null,
    deadline_cycle = nullif(btrim(coalesce(p_deadline_cycle, '')), ''),
    application_method = normalized_method,
    updated_at = now()
  where id = p_application_id;

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    application_record.student_id,
    auth.uid(),
    'application_deadline_to_verify',
    'L’échéance de candidature doit être vérifiée avant d’être présentée comme officielle.',
    jsonb_build_object(
      'application_id', p_application_id,
      'candidate_deadline', p_deadline,
      'cycle', nullif(btrim(coalesce(p_deadline_cycle, '')), ''),
      'application_method', normalized_method
    )
  );
end;
$$;

revoke all on function public.admin_set_application_deadline(uuid, date, text, timestamptz, text, text) from public, anon;
grant execute on function public.admin_set_application_deadline(uuid, date, text, timestamptz, text, text) to authenticated;

revoke all on function public.admin_mark_application_deadline_to_verify(uuid, date, text, text) from public, anon;
grant execute on function public.admin_mark_application_deadline_to_verify(uuid, date, text, text) to authenticated;
