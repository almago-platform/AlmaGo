-- Campus Allemagne: versioned procedure foundation.
-- Technical prerequisite for the focused intake flow.
-- No downstream visa/document workflow is activated by this migration.

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
  check (not student_required_by_default or owner in ('student', 'joint'))
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

alter table public.procedure_templates enable row level security;
alter table public.procedure_step_templates enable row level security;
alter table public.student_procedures enable row level security;

drop policy if exists "procedure templates admin only" on public.procedure_templates;
create policy "procedure templates admin only"
  on public.procedure_templates
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "procedure step templates admin only" on public.procedure_step_templates;
create policy "procedure step templates admin only"
  on public.procedure_step_templates
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "student procedures own or admin read" on public.student_procedures;
create policy "student procedures own or admin read"
  on public.student_procedures
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or (select public.is_admin())
  );

drop policy if exists "student procedures admin write" on public.student_procedures;
create policy "student procedures admin write"
  on public.student_procedures
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select, insert, update, delete on table public.procedure_templates to authenticated;
grant select, insert, update, delete on table public.procedure_step_templates to authenticated;
grant select, insert, update, delete on table public.student_procedures to authenticated;

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
    'procedure_changed',
    'Le suivi de procédure Campus Allemagne a été mis à jour.',
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

revoke all on function private.audit_campus_procedure_change() from public, anon, authenticated;
