-- Germany LOT 4.2: academic evidence metadata linked to private documents.
-- No original document content is altered by this migration.

create table public.academic_evidence (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null unique references public.documents(id) on delete cascade,
  evidence_type text not null check (evidence_type in (
    'definitive_admission',
    'conditional_admission',
    'bewerberbestaetigung',
    'admissible_university_correspondence'
  )),
  institution text not null check (btrim(institution) <> '' and char_length(institution) <= 240),
  evidence_date date not null,
  verification_status text not null default 'needs_review' check (verification_status in (
    'received',
    'needs_review',
    'accepted_for_pathway',
    'replace_required'
  )),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    verification_status <> 'accepted_for_pathway'
    or (verified_by is not null and verified_at is not null)
  )
);

create index academic_evidence_student_idx
  on public.academic_evidence(student_id, created_at desc);
create index academic_evidence_review_idx
  on public.academic_evidence(verification_status, created_at)
  where verification_status in ('received', 'needs_review', 'replace_required');

alter table public.academic_evidence enable row level security;

create policy "academic evidence own or admin read" on public.academic_evidence
  for select to authenticated
  using (student_id = (select auth.uid()) or public.is_admin());

create policy "academic evidence admin write" on public.academic_evidence
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete on table public.academic_evidence to authenticated;

create or replace function private.validate_academic_evidence()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  linked_student uuid;
  linked_status text;
begin
  select document.student_id, document.status::text
    into linked_student, linked_status
  from public.documents document
  where document.id = new.document_id;

  if linked_student is null then
    raise exception 'academic_evidence_document_not_found';
  end if;

  if linked_student <> new.student_id then
    raise exception 'academic_evidence_student_mismatch';
  end if;

  if new.evidence_date > (timezone('Europe/Berlin', now()))::date then
    raise exception 'academic_evidence_future_date';
  end if;

  if new.verified_at is not null and new.verified_at > now() then
    raise exception 'academic_evidence_future_verification';
  end if;

  if new.verification_status = 'accepted_for_pathway' then
    if linked_status <> 'approved' then
      raise exception 'academic_evidence_document_not_approved';
    end if;
    if new.verified_by is distinct from auth.uid() then
      raise exception 'academic_evidence_verifier_mismatch';
    end if;
    if not public.is_admin() then
      raise exception 'academic_evidence_admin_required';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.validate_academic_evidence() from public, anon, authenticated;

drop trigger if exists academic_evidence_validate on public.academic_evidence;
create trigger academic_evidence_validate
  before insert or update on public.academic_evidence
  for each row execute function private.validate_academic_evidence();

drop trigger if exists academic_evidence_set_updated_at on public.academic_evidence;
create trigger academic_evidence_set_updated_at
  before update on public.academic_evidence
  for each row execute procedure public.set_updated_at();
