-- Student V2 consolidation: enrich the existing procedure foundation without replacing it.
-- This migration is additive and upgrades the already-live P1/P2 procedure model.

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
  document_id uuid references public.documents(id) on delete set null,
  required_for text[] not null default '{}',
  requested_from_student boolean not null default false,
  student_request_reason text,
  student_request_due_date date,
  requires_tunisian_authentication boolean not null default false,
  requires_translation boolean not null default false,
  requires_german_legalisation boolean,
  legalisation_status text check (
    legalisation_status is null
    or legalisation_status in ('not_required','to_verify','required','submitted_external','completed')
  ),
  legalisation_reason text,
  due_date date,
  deadline_kind text check (
    deadline_kind is null
    or deadline_kind in ('official_hard_deadline','official_external_date','internal_target','source_review_date')
  ),
  deadline_cycle text,
  source_url text,
  source_verified_at timestamptz,
  admin_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_procedure_id, requirement_key),
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
  add column if not exists deadline_kind text check (
    deadline_kind is null
    or deadline_kind in ('official_hard_deadline','official_external_date','internal_target','source_review_date')
  ),
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

alter table public.student_document_requirements enable row level security;

drop policy if exists "document requirements own or admin read"
  on public.student_document_requirements;
create policy "document requirements own or admin read"
  on public.student_document_requirements
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "document requirements admin write"
  on public.student_document_requirements;
create policy "document requirements admin write"
  on public.student_document_requirements
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select, insert, update, delete
  on table public.student_document_requirements
  to authenticated;

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

drop trigger if exists student_procedures_audit_change
  on public.student_procedures;
create trigger student_procedures_audit_change
  after insert or update or delete on public.student_procedures
  for each row execute procedure private.audit_campus_procedure_change();

drop trigger if exists student_document_requirements_audit_change
  on public.student_document_requirements;
create trigger student_document_requirements_audit_change
  after insert or update or delete on public.student_document_requirements
  for each row execute procedure private.audit_campus_procedure_change();

revoke all on function private.audit_campus_procedure_change()
  from public, anon, authenticated;
