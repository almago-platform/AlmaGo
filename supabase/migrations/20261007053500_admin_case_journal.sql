-- Admin V7: immutable internal case journal for operational continuity.
-- Notes are admin-only and never exposed through student_history.

create table if not exists public.student_case_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in (
    'internal_note',
    'call',
    'email',
    'whatsapp',
    'meeting',
    'document_request',
    'university_contact'
  )),
  content text not null check (char_length(btrim(content)) between 2 and 4000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (occurred_at <= now() + interval '5 minutes')
);

create index if not exists student_case_notes_student_created_idx
  on public.student_case_notes(student_id, occurred_at desc, created_at desc);

create index if not exists student_case_notes_contact_idx
  on public.student_case_notes(student_id, occurred_at desc)
  where kind <> 'internal_note';

alter table public.student_case_notes enable row level security;

drop policy if exists "student case notes admin read"
  on public.student_case_notes;
create policy "student case notes admin read"
  on public.student_case_notes
  for select to authenticated
  using ((select public.is_admin()));

drop policy if exists "student case notes admin insert"
  on public.student_case_notes;
create policy "student case notes admin insert"
  on public.student_case_notes
  for insert to authenticated
  with check (
    (select public.is_admin())
    and author_id = (select auth.uid())
  );

grant select, insert on table public.student_case_notes to authenticated;

create or replace function private.audit_student_case_note_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.technical_logs (
    actor_id,
    event_name,
    entity_type,
    entity_id,
    metadata
  )
  values (
    auth.uid(),
    'admin_case_note_created',
    'student',
    new.student_id,
    jsonb_build_object(
      'note_id', new.id,
      'kind', new.kind,
      'occurred_at', new.occurred_at
    )
  );

  return new;
end;
$$;

drop trigger if exists student_case_notes_audit_insert
  on public.student_case_notes;
create trigger student_case_notes_audit_insert
  after insert on public.student_case_notes
  for each row execute procedure private.audit_student_case_note_insert();

revoke all on function private.audit_student_case_note_insert()
  from public, anon, authenticated;
