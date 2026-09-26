-- LOT 4.2: persist academic classifications separately from uploaded files.
-- A composite candidate key lets the FK reject cross-student document links.
create unique index documents_id_student_unique
  on public.documents(id, student_id);

create table public.academic_evidence (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid,
  evidence_type text not null check (evidence_type in (
    'definitive_admission',
    'conditional_admission',
    'bewerberbestaetigung',
    'admissible_university_correspondence'
  )),
  institution text,
  evidence_date date,
  origin text not null check (origin in (
    'student_declared', 'admin_verified_fact', 'official_document'
  )),
  verification_status text not null default 'received' check (verification_status in (
    'received', 'needs_review', 'accepted_for_pathway', 'replace_required'
  )),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_evidence_document_owner_fk
    foreign key (document_id, student_id)
    references public.documents(id, student_id)
    on delete set null (document_id),
  constraint academic_evidence_verification_pair check (
    (verified_by is null) = (verified_at is null)
  )
);

create index academic_evidence_student_created_idx
  on public.academic_evidence(student_id, created_at desc);
create index academic_evidence_document_idx
  on public.academic_evidence(document_id)
  where document_id is not null;

create or replace function private.enforce_academic_evidence()
returns trigger
language plpgsql
security invoker
set search_path = public, private
as $$
declare
  linked_document public.documents;
begin
  new.institution := nullif(trim(new.institution), '');
  new.updated_at := now();

  if new.evidence_date is not null and new.evidence_date > current_date then
    raise exception 'academic_evidence_date_invalid';
  end if;

  if new.verified_at is not null and new.verified_at > now() then
    raise exception 'academic_evidence_verification_time_invalid';
  end if;

  if new.verification_status = 'accepted_for_pathway' then
    if new.origin <> 'official_document'
      or new.document_id is null
      or new.institution is null
      or new.evidence_date is null
      or new.verified_by is null
      or new.verified_at is null then
      raise exception 'academic_evidence_acceptance_prerequisites_missing';
    end if;

    select * into linked_document
    from public.documents
    where id = new.document_id and student_id = new.student_id
    for update;

    if not found or linked_document.status::text <> 'approved' then
      raise exception 'academic_evidence_document_not_approved';
    end if;

    if new.verified_by <> auth.uid()
      or not exists (
        select 1 from public.user_roles
        where user_id = new.verified_by and role = 'admin'
      ) then
      raise exception 'academic_evidence_admin_verifier_required';
    end if;
  end if;

  return new;
end;
$$;

revoke execute on function private.enforce_academic_evidence() from public, anon, authenticated;

create trigger academic_evidence_enforce_contract
  before insert or update on public.academic_evidence
  for each row execute procedure private.enforce_academic_evidence();

-- If document approval is withdrawn, its separate pathway classification fails closed.
create or replace function private.invalidate_academic_evidence_for_document()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if tg_op = 'DELETE' then
    update public.academic_evidence
    set verification_status = 'needs_review',
        document_id = null,
        verified_by = null,
        verified_at = null,
        updated_at = now()
    where document_id = old.id;
    return old;
  end if;

  if old.status::text = 'approved' and new.status::text <> 'approved' then
    update public.academic_evidence
    set verification_status = case
          when new.status::text = 'replace_required' then 'replace_required'
          else 'needs_review'
        end,
        verified_by = null,
        verified_at = null,
        updated_at = now()
    where document_id = new.id
      and verification_status = 'accepted_for_pathway';
  end if;
  return new;
end;
$$;

revoke execute on function private.invalidate_academic_evidence_for_document()
  from public, anon, authenticated;

create trigger documents_invalidate_academic_evidence
  before update of status or delete on public.documents
  for each row execute procedure private.invalidate_academic_evidence_for_document();

alter table public.academic_evidence enable row level security;

create policy "academic evidence own or admin read"
  on public.academic_evidence for select to authenticated
  using (student_id = (select auth.uid()) or (select public.is_admin()));

create policy "academic evidence admin manage"
  on public.academic_evidence for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

revoke all on table public.academic_evidence from anon, authenticated;
grant select, insert, update, delete on table public.academic_evidence to authenticated;
