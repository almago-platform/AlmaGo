begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

-- Synthetic identities and documents; everything is rolled back at the end.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('90000000-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admission-fixture-a@example.test',
   crypt('local-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('90000000-0000-4000-8000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admission-fixture-b@example.test',
   crypt('local-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('90000000-0000-4000-8000-000000000003', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'admission-fixture-admin@example.test',
   crypt('local-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.user_roles
set role = 'admin'
where user_id = '90000000-0000-4000-8000-000000000003';

update public.customer_access
set status = 'client_active'::public.customer_lifecycle_status
where user_id in (
  '90000000-0000-4000-8000-000000000001',
  '90000000-0000-4000-8000-000000000002'
);

-- Seed only unrelated catalog and application fixtures before reenabling all
-- triggers. No fixture is ever committed to the remote database.
set session_replication_role = replica;

insert into public.universities (id, name, source_url, website_url, verified_at)
values ('91000000-0000-4000-8000-000000000001', 'Fixture University',
        'https://example.test/source', 'https://example.test', now());

insert into public.programs (
  id, university_id, name, degree_level, application_url, source_url,
  verified_at, is_active, intake_terms
) values (
  '92000000-0000-4000-8000-000000000001',
  '91000000-0000-4000-8000-000000000001',
  'Fixture Programme', 'master', 'https://example.test/apply',
  'https://example.test/program', now(), true, array['winter']
);

insert into public.applications (id, student_id, program_id, intake)
values
  ('93000000-0000-4000-8000-000000000001',
   '90000000-0000-4000-8000-000000000001',
   '92000000-0000-4000-8000-000000000001', 'winter'),
  ('93000000-0000-4000-8000-000000000002',
   '90000000-0000-4000-8000-000000000002',
   '92000000-0000-4000-8000-000000000001', 'winter');

set session_replication_role = origin;

create function pg_temp.admission_actor(uid uuid, assurance text)
returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    jsonb_build_object('sub', uid, 'role', 'authenticated', 'aal', assurance)::text, true);
end;
$$;

create function pg_temp.admission_denied(statement text)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
  execute statement;
  return false;
exception when insufficient_privilege or raise_exception then
  return true;
end;
$$;

create function pg_temp.admission_delete_doc(target_id uuid)
returns bigint language plpgsql security invoker set search_path = '' as $admission_fn$
declare deleted_count bigint;
begin
  delete from public.documents where id = target_id;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$admission_fn$;

-- Admin role without second-factor assurance cannot add files on behalf of students.
select pg_temp.admission_actor('90000000-0000-4000-8000-000000000003', 'aal1');
set local role authenticated;
select ok(pg_temp.admission_denied(
  $$insert into public.documents (
      id, student_id, uploaded_by, storage_path, original_filename,
      mime_type, size_bytes, category, status
    ) values (
      '94000000-0000-4000-8000-000000000001',
      '90000000-0000-4000-8000-000000000001',
      '90000000-0000-4000-8000-000000000003',
      '90000000-0000-4000-8000-000000000001/admissions/94000000-0000-4000-8000-000000000001/test.pdf',
      'test.pdf', 'application/pdf', 150, 'admission', 'pending'
    )$$
), 'admin AAL1 cannot insert a private letter belonging to a client');

select ok(pg_temp.admission_denied(
  $$insert into storage.objects (bucket_id, name) values
    ('student-documents',
     '90000000-0000-4000-8000-000000000001/admissions/94000000-0000-4000-8000-000000000001/test.pdf')$$
), 'admin AAL1 cannot upload a letter to private storage');
reset role;

-- A genuine AAL2 admin can register a pending document for the selected student.
select pg_temp.admission_actor('90000000-0000-4000-8000-000000000003', 'aal2');
set local role authenticated;
select lives_ok(
  $$insert into storage.objects (bucket_id, name)
    values ('student-documents',
      '90000000-0000-4000-8000-000000000001/admissions/94000000-0000-4000-8000-000000000001/test.pdf')$$,
  'admin AAL2 may upload a private letter under admissions/'
);
select lives_ok(
  $$insert into public.documents (
      id, student_id, uploaded_by, storage_path, original_filename,
      mime_type, size_bytes, category, status
    ) values (
      '94000000-0000-4000-8000-000000000001',
      '90000000-0000-4000-8000-000000000001',
      '90000000-0000-4000-8000-000000000003',
      '90000000-0000-4000-8000-000000000001/admissions/94000000-0000-4000-8000-000000000001/test.pdf',
      'test.pdf', 'application/pdf', 150, 'admission', 'pending'
    )$$,
  'admin AAL2 may add a pending PDF record for the student'
);
select lives_ok(
  $$insert into public.academic_evidence (
      id, student_id, application_id, document_id, evidence_type,
      institution, origin, verification_status
    ) values (
      '95000000-0000-4000-8000-000000000001',
      '90000000-0000-4000-8000-000000000001',
      '93000000-0000-4000-8000-000000000001',
      '94000000-0000-4000-8000-000000000001',
      'conditional_admission', 'Fixture University',
      'official_document', 'needs_review'
    )$$,
  'linked university evidence remains pending until separate human review'
);
select throws_ok(
  $$insert into public.academic_evidence (
      student_id, application_id, document_id, evidence_type, origin
    ) values (
      '90000000-0000-4000-8000-000000000001',
      '93000000-0000-4000-8000-000000000002',
      '94000000-0000-4000-8000-000000000001',
      'conditional_admission', 'official_document'
    )$$,
  '23503', null, 'cross-student application link rejected by composite FK'
);
select throws_ok(
  $$update public.academic_evidence
    set verification_status = 'accepted_for_pathway',
        evidence_date = current_date,
        verified_by = '90000000-0000-4000-8000-000000000003',
        verified_at = now()
    where id = '95000000-0000-4000-8000-000000000001'$$,
  'P0001', 'academic_evidence_document_not_approved',
  'pending PDF cannot be accepted as official evidence'
);
select is(
  (select status::text from public.applications
   where id = '93000000-0000-4000-8000-000000000001'),
  'draft', 'adding a letter does not invent an application decision'
);
reset role;

-- Student A can see their own pending file and letter, without being able
-- to delete a PDF that Campus uploaded. Student B cannot see either.
select pg_temp.admission_actor('90000000-0000-4000-8000-000000000001', 'aal1');
set local role authenticated;
select is(
  (select count(*) from public.academic_evidence
   where id = '95000000-0000-4000-8000-000000000001'),
  1::bigint, 'student A can read the linked letter'
);
select is(
  (select count(*) from public.documents
   where id = '94000000-0000-4000-8000-000000000001'),
  1::bigint, 'student A can read the private PDF metadata'
);
select is(
  (select count(*) from storage.objects
   where bucket_id = 'student-documents'
     and name like '90000000-0000-4000-8000-000000000001/admissions/%'),
  1::bigint, 'student A can open own private admission object'
);
select is(
  (select public.can_delete_own_document_object(
    '90000000-0000-4000-8000-000000000001/admissions/94000000-0000-4000-8000-000000000001/test.pdf')),
  false, 'student A cannot delete an admin-uploaded PDF object'
);
select is(
  pg_temp.admission_delete_doc('94000000-0000-4000-8000-000000000001'),
  0::bigint, 'student A cannot remove an admin-uploaded PDF metadata row'
);
reset role;

select pg_temp.admission_actor('90000000-0000-4000-8000-000000000002', 'aal1');
set local role authenticated;
select is(
  (select count(*) from public.academic_evidence
   where id = '95000000-0000-4000-8000-000000000001'),
  0::bigint, 'student B cannot read student A admission evidence'
);
select is(
  (select count(*) from public.documents
   where id = '94000000-0000-4000-8000-000000000001'),
  0::bigint, 'student B cannot read student A admission document'
);
select is(
  (select count(*) from storage.objects
   where bucket_id = 'student-documents'
     and name like '90000000-0000-4000-8000-000000000001/admissions/%'),
  0::bigint, 'student B cannot read student A private storage path'
);
reset role;

select * from finish();
rollback;
