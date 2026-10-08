-- UX-5b: record a real university letter against exactly one student's existing application.
-- The PDF stays in the existing private student-documents bucket and document review workflow.
-- No old rows, applications, statuses, or official deadlines are changed.

create unique index if not exists applications_id_student_unique
  on public.applications (id, student_id);

alter table public.academic_evidence
  add column if not exists application_id uuid;

alter table public.academic_evidence
  drop constraint if exists academic_evidence_application_owner_fk;

alter table public.academic_evidence
  add constraint academic_evidence_application_owner_fk
  foreign key (application_id, student_id)
  references public.applications (id, student_id)
  on delete set null (application_id);

alter table public.academic_evidence
  drop constraint if exists academic_evidence_application_type_check;

alter table public.academic_evidence
  add constraint academic_evidence_application_type_check
  check (
    application_id is null
    or evidence_type in ('definitive_admission', 'conditional_admission')
  );

create index if not exists academic_evidence_application_idx
  on public.academic_evidence (application_id, created_at desc)
  where application_id is not null;

-- Existing student-owned uploads remain unchanged. Only a verified admin may
-- insert an admission PDF as a document belonging to another student.
drop policy if exists "documents admin admission insert" on public.documents;
create policy "documents admin admission insert"
  on public.documents
  for insert to authenticated
  with check (
    (select public.is_admin())
    and uploaded_by = (select auth.uid())
    and category = 'admission'
    and mime_type = 'application/pdf'
    and status::text = 'pending'
    and size_bytes > 0
    and size_bytes <= 10485760
    and storage_path like (student_id::text || '/admissions/%')
  );

-- Students may delete only documents THEY uploaded themselves, not university
-- letters added by Campus, even while those letters await human review.
drop policy if exists "documents student allowed delete" on public.documents;
create policy "documents student allowed delete"
  on public.documents
  for delete to authenticated
  using (
    (select public.is_admin())
    or (
      student_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and status::text in ('pending', 'rejected', 'replace_required')
    )
  );

create or replace function public.can_delete_own_document_object(object_name text)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select exists (
    select 1
    from public.documents
    where storage_path = object_name
      and student_id = (select auth.uid())
      and uploaded_by = (select auth.uid())
      and status::text in ('pending', 'rejected', 'replace_required')
  );
$$;

drop policy if exists "document objects admin admission upload" on storage.objects;
create policy "document objects admin admission upload"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'student-documents'
    and (select public.is_admin())
    and (storage.foldername(name))[2] = 'admissions'
    and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  );

drop policy if exists "document objects admin admission cleanup" on storage.objects;
create policy "document objects admin admission cleanup"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'student-documents'
    and (select public.is_admin())
    and (storage.foldername(name))[2] = 'admissions'
  );
