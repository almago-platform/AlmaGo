-- Campus Allemagne P1: versioned procedure foundation.
-- Extends AlmaGo's existing checklist, document, project, history and deadline primitives.
-- No procedure generation or student-facing workflow is introduced here.

create table if not exists public.procedure_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  version integer not null check (version > 0),
  title text not null,
  route_key text not null,
  active_from date,
  active_to date,
  source_policy_version text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (key, version),
  check (active_to is null or active_from is null or active_to >= active_from)
);

create table if not exists public.procedure_step_templates (
  id uuid primary key default gen_random_uuid(),
  procedure_template_id uuid not null references public.procedure_templates(id) on delete cascade,
  key text not null,
  title text not null,
  owner text not null check (owner in ('student', 'almago', 'external', 'joint')),
  student_required_by_default boolean not null default false,
  blocking boolean not null default false,
  applies_if jsonb not null default '{}'::jsonb,
  depends_on_keys text[] not null default '{}',
  deadline_rule jsonb not null default '{}'::jsonb,
  student_help text,
  admin_help text,
  official_source_url text,
  source_verified_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (procedure_template_id, key),
  check (
    not student_required_by_default
    or owner in ('student', 'joint')
  )
);

create table if not exists public.student_procedures (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.student_projects(id) on delete set null,
  procedure_template_id uuid references public.procedure_templates(id) on delete restrict,
  procedure_template_key text not null,
  procedure_template_version integer not null check (procedure_template_version > 0),
  route_key text not null,
  target_intake text,
  status text not null default 'not_started' check (status in (
    'not_started',
    'ready',
    'waiting_student',
    'waiting_almago',
    'waiting_external',
    'in_progress',
    'blocked',
    'completed',
    'not_applicable'
  )),
  template_snapshot jsonb not null default '{}'::jsonb,
  is_current boolean not null default true,
  superseded_by uuid references public.student_procedures(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists student_procedures_one_current_per_student
  on public.student_procedures(student_id)
  where is_current;

create index if not exists student_procedures_student_created_idx
  on public.student_procedures(student_id, created_at desc);

create table if not exists public.student_document_requirements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  student_procedure_id uuid references public.student_procedures(id) on delete cascade,
  requirement_key text not null,
  label text not null,
  category text not null,
  status text not null default 'requested' check (status in (
    'requested',
    'uploaded',
    'under_review',
    'replacement_required',
    'accepted_original',
    'authentication_required',
    'authentication_in_progress',
    'authenticated',
    'translation_required',
    'translation_in_progress',
    'translated',
    'legalisation_to_verify',
    'legalisation_required',
    'legalisation_in_progress',
    'ready',
    'not_applicable'
  )),
  document_id uuid,
  required_for text[] not null default '{}',
  requested_from_student boolean not null default false,
  student_request_reason text,
  student_request_due_date date,
  requires_tunisian_authentication boolean not null default false,
  requires_translation boolean not null default false,
  requires_german_legalisation boolean,
  legalisation_status text check (legalisation_status is null or legalisation_status in (
    'not_required',
    'to_verify',
    'required',
    'submitted_external',
    'completed'
  )),
  legalisation_reason text,
  due_date date,
  deadline_kind text check (deadline_kind is null or deadline_kind in (
    'official_hard_deadline',
    'official_external_date',
    'internal_target',
    'source_review_date'
  )),
  deadline_cycle text,
  source_url text,
  source_verified_at timestamptz,
  admin_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_procedure_id, requirement_key),
  foreign key (document_id, student_id)
    references public.documents(id, student_id)
    on delete set null,
  check (
    not requested_from_student
    or (
      student_request_reason is not null
      and char_length(btrim(student_request_reason)) > 0
    )
  ),
  check (
    deadline_kind <> 'official_hard_deadline'
    or (
      due_date is not null
      and source_url is not null
      and source_verified_at is not null
      and deadline_cycle is not null
      and char_length(btrim(deadline_cycle)) > 0
    )
  )
);

create index if not exists student_document_requirements_student_status_idx
  on public.student_document_requirements(student_id, status);

create index if not exists student_document_requirements_procedure_idx
  on public.student_document_requirements(student_procedure_id, created_at);

alter table public.student_checklist_items
  add column if not exists student_procedure_id uuid references public.student_procedures(id) on delete cascade,
  add column if not exists procedure_step_template_id uuid references public.procedure_step_templates(id) on delete set null,
  add column if not exists owner text check (owner is null or owner in ('student', 'almago', 'external', 'joint')),
  add column if not exists requires_student_action boolean not null default false,
  add column if not exists student_action_reason text,
  add column if not exists student_action_kind text,
  add column if not exists deadline_kind text check (deadline_kind is null or deadline_kind in (
    'official_hard_deadline',
    'official_external_date',
    'internal_target',
    'source_review_date'
  )),
  add column if not exists deadline_cycle text,
  add column if not exists official_source_url text,
  add column if not exists official_source_verified_at timestamptz,
  add column if not exists blocked_reason text,
  add column if not exists manual_due_date_override boolean not null default false;

alter table public.student_checklist_items
  drop constraint if exists student_checklist_items_status_check;

alter table public.student_checklist_items
  add constraint student_checklist_items_status_check check (status in (
    'todo',
    'not_started',
    'ready',
    'waiting_student',
    'waiting_almago',
    'waiting_external',
    'in_progress',
    'blocked',
    'completed',
    'not_applicable'
  ));

alter table public.student_checklist_items
  drop constraint if exists student_checklist_items_student_action_reason_check;

alter table public.student_checklist_items
  add constraint student_checklist_items_student_action_reason_check check (
    not requires_student_action
    or (
      owner in ('student', 'joint')
      and student_action_reason is not null
      and char_length(btrim(student_action_reason)) > 0
    )
  );

alter table public.student_checklist_items
  drop constraint if exists student_checklist_items_official_deadline_truth_check;

alter table public.student_checklist_items
  add constraint student_checklist_items_official_deadline_truth_check check (
    deadline_kind <> 'official_hard_deadline'
    or (
      due_date is not null
      and official_source_url is not null
      and official_source_verified_at is not null
      and deadline_cycle is not null
      and char_length(btrim(deadline_cycle)) > 0
    )
  );

create index if not exists student_checklist_items_procedure_idx
  on public.student_checklist_items(student_procedure_id, created_at);

alter table public.procedure_templates enable row level security;
alter table public.procedure_step_templates enable row level security;
alter table public.student_procedures enable row level security;
alter table public.student_document_requirements enable row level security;

drop policy if exists "procedure templates admin only" on public.procedure_templates;
create policy "procedure templates admin only"
  on public.procedure_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "procedure step templates admin only" on public.procedure_step_templates;
create policy "procedure step templates admin only"
  on public.procedure_step_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "student procedures own or admin read" on public.student_procedures;
create policy "student procedures own or admin read"
  on public.student_procedures
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "student procedures admin write" on public.student_procedures;
create policy "student procedures admin write"
  on public.student_procedures
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "document requirements own or admin read" on public.student_document_requirements;
create policy "document requirements own or admin read"
  on public.student_document_requirements
  for select to authenticated
  using (student_id = auth.uid() or public.is_admin());

drop policy if exists "document requirements admin write" on public.student_document_requirements;
create policy "document requirements admin write"
  on public.student_document_requirements
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.procedure_templates to authenticated;
grant select, insert, update, delete on table public.procedure_step_templates to authenticated;
grant select, insert, update, delete on table public.student_procedures to authenticated;
grant select, insert, update, delete on table public.student_document_requirements to authenticated;

create or replace function private.audit_campus_procedure_change()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  target_student_id uuid;
  target_entity_id uuid;
begin
  target_student_id := coalesce(new.student_id, old.student_id);
  target_entity_id := coalesce(new.id, old.id);

  insert into public.student_history (
    student_id,
    actor_id,
    event_type,
    message,
    metadata
  )
  values (
    target_student_id,
    auth.uid(),
    case tg_table_name
      when 'student_procedures' then 'procedure_changed'
      when 'student_document_requirements' then 'document_requirement_changed'
      else 'campus_procedure_changed'
    end,
    case tg_table_name
      when 'student_procedures' then 'Le suivi de procédure Campus Allemagne a été mis à jour.'
      when 'student_document_requirements' then 'Une exigence documentaire Campus Allemagne a été mise à jour.'
      else 'Le dossier Campus Allemagne a été mis à jour.'
    end,
    jsonb_build_object(
      'table', tg_table_name,
      'operation', tg_op,
      'entity_id', target_entity_id
    )
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists student_procedures_audit_change on public.student_procedures;
create trigger student_procedures_audit_change
  after insert or update or delete on public.student_procedures
  for each row execute procedure private.audit_campus_procedure_change();

drop trigger if exists student_document_requirements_audit_change on public.student_document_requirements;
create trigger student_document_requirements_audit_change
  after insert or update or delete on public.student_document_requirements
  for each row execute procedure private.audit_campus_procedure_change();

revoke all on function private.audit_campus_procedure_change() from public, anon, authenticated;
