-- Admin V6: explicit Campus Allemagne advisor ownership for linked person dossiers.
-- Additive only: no auth/RLS architecture replacement and no parallel CRM entity.

create table if not exists public.student_case_assignments (
  student_id uuid primary key references auth.users(id) on delete cascade,
  assigned_admin_id uuid references auth.users(id) on delete set null,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_case_assignments_admin_idx
  on public.student_case_assignments(assigned_admin_id, updated_at desc)
  where assigned_admin_id is not null;

alter table public.student_case_assignments enable row level security;

drop policy if exists "student case assignments admin only"
  on public.student_case_assignments;
create policy "student case assignments admin only"
  on public.student_case_assignments
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

grant select, insert, update, delete
  on table public.student_case_assignments
  to authenticated;

create or replace function private.validate_student_case_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if new.assigned_admin_id is not null
    and not exists (
      select 1
      from public.user_roles roles
      where roles.user_id = new.assigned_admin_id
        and roles.role = 'admin'
    )
  then
    raise exception 'assigned_user_must_be_admin';
  end if;

  if tg_op = 'INSERT'
    or new.assigned_admin_id is distinct from old.assigned_admin_id
  then
    new.assigned_at := now();
  end if;

  new.assigned_by := auth.uid();
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists student_case_assignments_validate
  on public.student_case_assignments;
create trigger student_case_assignments_validate
  before insert or update on public.student_case_assignments
  for each row execute procedure private.validate_student_case_assignment();

revoke all on function private.validate_student_case_assignment()
  from public, anon, authenticated;

create or replace function private.audit_student_case_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_student_id uuid;
  old_admin_id uuid;
  new_admin_id uuid;
begin
  target_student_id := coalesce(new.student_id, old.student_id);
  old_admin_id := case when tg_op = 'INSERT' then null else old.assigned_admin_id end;
  new_admin_id := case when tg_op = 'DELETE' then null else new.assigned_admin_id end;

  insert into public.technical_logs (
    actor_id,
    event_name,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'admin_case_assignment_changed',
    'student',
    target_student_id,
    jsonb_build_object(
      'operation', tg_op,
      'previous_admin_id', old_admin_id,
      'assigned_admin_id', new_admin_id
    )
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists student_case_assignments_audit
  on public.student_case_assignments;
create trigger student_case_assignments_audit
  after insert or update or delete on public.student_case_assignments
  for each row execute procedure private.audit_student_case_assignment();

revoke all on function private.audit_student_case_assignment()
  from public, anon, authenticated;
