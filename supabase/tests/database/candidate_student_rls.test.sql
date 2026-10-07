begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();

-- Stable isolated identities. These rows exist only inside this rolled-back test.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'prospect@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client-a@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client-b@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', crypt('local-test-only', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now());

update public.user_roles
set role = 'admin'
where user_id = '10000000-0000-0000-0000-000000000004';

update public.customer_access
set status = case user_id
  when '10000000-0000-0000-0000-000000000001' then 'prospect_account'::public.customer_lifecycle_status
  when '10000000-0000-0000-0000-000000000002' then 'client_active'::public.customer_lifecycle_status
  when '10000000-0000-0000-0000-000000000003' then 'client_completed'::public.customer_lifecycle_status
  else status
end
where user_id in (
  '10000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003'
);

insert into public.universities (id, name, source_url, website_url, verified_at)
values ('20000000-0000-0000-0000-000000000001', 'RLS Test University', 'https://example.test/source', 'https://example.test', now());

insert into public.programs (
  id, university_id, name, degree_level, application_url, source_url,
  verified_at, is_active, intake_terms
)
values (
  '21000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'RLS Test Program', 'master', 'https://example.test/apply',
  'https://example.test/program', now(), true, array['winter']
);

insert into public.language_courses (
  id, title, provider_name, language, purpose, source_url, verified_at, is_active
)
values (
  '22000000-0000-0000-0000-000000000001', 'RLS German', 'RLS Provider',
  'German', 'study_preparation', 'https://example.test/language', now(), true
);

insert into public.prospects (id, email, user_id)
values
  ('23000000-0000-0000-0000-000000000001', 'prospect@example.test', '10000000-0000-0000-0000-000000000001'),
  ('23000000-0000-0000-0000-000000000002', 'client-a@example.test', '10000000-0000-0000-0000-000000000002'),
  ('23000000-0000-0000-0000-000000000003', 'client-b@example.test', '10000000-0000-0000-0000-000000000003');

insert into public.orientations (id, prospect_id, engine_version)
values
  ('24000000-0000-0000-0000-000000000001', '23000000-0000-0000-0000-000000000001', 'rls-test'),
  ('24000000-0000-0000-0000-000000000002', '23000000-0000-0000-0000-000000000002', 'rls-test'),
  ('24000000-0000-0000-0000-000000000003', '23000000-0000-0000-0000-000000000003', 'rls-test');

-- Fixture triggers are disabled only while privileged seed rows are installed.
-- RLS and all triggers are enabled again before any assertion is executed.
set session_replication_role = replica;

insert into public.documents (id, student_id, storage_path, original_filename, mime_type, size_bytes, uploaded_by)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001/prospect.pdf', 'prospect.pdf', 'application/pdf', 100, '10000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002/client-a.pdf', 'client-a.pdf', 'application/pdf', 100, '10000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003/client-b.pdf', 'client-b.pdf', 'application/pdf', 100, '10000000-0000-0000-0000-000000000003');

insert into public.student_projects (id, student_id, path)
values
  ('31000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'university_search'),
  ('31000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'university_search'),
  ('31000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'university_search');

insert into public.student_intake_cases (student_id, orientation_id, orientation_confirmed_at)
values
  ('10000000-0000-0000-0000-000000000001', '24000000-0000-0000-0000-000000000001', now()),
  ('10000000-0000-0000-0000-000000000002', '24000000-0000-0000-0000-000000000002', now()),
  ('10000000-0000-0000-0000-000000000003', '24000000-0000-0000-0000-000000000003', now());

insert into storage.objects (id, bucket_id, name)
values
  ('32000000-0000-0000-0000-000000000001', 'student-documents', '10000000-0000-0000-0000-000000000001/prospect.pdf'),
  ('32000000-0000-0000-0000-000000000002', 'student-documents', '10000000-0000-0000-0000-000000000002/client-a.pdf'),
  ('32000000-0000-0000-0000-000000000003', 'student-documents', '10000000-0000-0000-0000-000000000003/client-b.pdf');

insert into public.applications (id, student_id, program_id, intake)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'winter'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000001', 'winter'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', 'winter');

insert into public.application_events (id, application_id, event_type)
values
  ('41000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'rls_test'),
  ('41000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'rls_test'),
  ('41000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000003', 'rls_test');

insert into public.program_recommendations (id, student_id, program_id, admin_id)
values
  ('42000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('42000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('42000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004');

insert into public.student_checklist_items (id, student_id, title)
values
  ('43000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Prospect private item'),
  ('43000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Client A item'),
  ('43000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Client B item');

insert into public.student_document_requirements (id, student_id, requirement_key, label, category)
values
  ('44000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'prospect-test', 'Prospect requirement', 'other'),
  ('44000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'client-a-test', 'Client A requirement', 'other'),
  ('44000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'client-b-test', 'Client B requirement', 'other');

insert into public.student_dossier_messages (id, student_id, sender_id, sender_role, body)
values
  ('45000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'student', 'Prospect private message'),
  ('45000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'student', 'Client A message'),
  ('45000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'student', 'Client B message');

insert into public.student_history (id, student_id, event_type, message)
values
  ('46000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'rls_test', 'Prospect history'),
  ('46000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'rls_test', 'Client A history'),
  ('46000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'rls_test', 'Client B history');

insert into public.student_language_course_selections (id, student_id, language_course_id)
values
  ('47000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001'),
  ('47000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '22000000-0000-0000-0000-000000000001'),
  ('47000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', '22000000-0000-0000-0000-000000000001');

insert into public.student_procedures (
  id, student_id, procedure_template_key, procedure_template_version, route_key
)
values
  ('48000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'rls-test', 1, 'rls-test'),
  ('48000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'rls-test', 1, 'rls-test'),
  ('48000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'rls-test', 1, 'rls-test');

insert into public.academic_evidence (id, student_id, evidence_type, origin)
values
  ('49000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'conditional_admission', 'student_declared'),
  ('49000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'conditional_admission', 'student_declared'),
  ('49000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'conditional_admission', 'student_declared');

set session_replication_role = origin;

create function pg_temp.set_actor(p_uid uuid, p_aal text default 'aal1')
returns void language plpgsql as $$
begin
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', p_uid, 'role', 'authenticated', 'aal', p_aal)::text,
    true
  );
end;
$$;

create function pg_temp.try_self_update(p_table regclass, p_id uuid)
returns integer language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  execute format('update %s set id = id where id = $1', p_table) using p_id;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

create function pg_temp.try_delete(p_table regclass, p_id uuid)
returns integer language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  execute format('delete from %s where id = $1', p_table) using p_id;
  get diagnostics changed = row_count;
  return changed;
end;
$$;

-- Anonymous callers have no private-table access at all.
set local role anon;
select throws_ok('select * from public.academic_evidence', '42501', 'anon cannot read academic evidence');
select throws_ok('select * from public.applications', '42501', 'anon cannot read applications');
select throws_ok('select * from public.application_events', '42501', 'anon cannot read application events');
select throws_ok('select * from public.program_recommendations', '42501', 'anon cannot read recommendations');
select throws_ok('select * from public.student_checklist_items', '42501', 'anon cannot read checklist items');
select throws_ok('select * from public.student_document_requirements', '42501', 'anon cannot read document requirements');
select throws_ok('select * from public.student_dossier_messages', '42501', 'anon cannot read dossier messages');
select throws_ok('select * from public.student_history', '42501', 'anon cannot read student history');
select throws_ok('select * from public.student_language_course_selections', '42501', 'anon cannot read language selections');
select throws_ok('select * from public.student_procedures', '42501', 'anon cannot read procedures');
reset role;

-- A technical student role plus prospect lifecycle is never client entitlement.
select pg_temp.set_actor('10000000-0000-0000-0000-000000000001');
set local role authenticated;
select is((select count(*) from public.academic_evidence), 0::bigint, 'prospect cannot select own academic evidence');
select is((select count(*) from public.applications), 0::bigint, 'prospect cannot select own applications');
select is((select count(*) from public.application_events), 0::bigint, 'prospect cannot select own application events');
select is((select count(*) from public.program_recommendations), 0::bigint, 'prospect cannot select own recommendations');
select is((select count(*) from public.student_checklist_items), 0::bigint, 'prospect cannot select own checklist');
select is((select count(*) from public.student_document_requirements), 0::bigint, 'prospect cannot select own document requirements');
select is((select count(*) from public.student_dossier_messages), 0::bigint, 'prospect cannot select own dossier messages');
select is((select count(*) from public.student_history), 0::bigint, 'prospect cannot select own history');
select is((select count(*) from public.student_language_course_selections), 0::bigint, 'prospect cannot select own language selection');
select is((select count(*) from public.student_procedures), 0::bigint, 'prospect cannot select own procedures');

select is(pg_temp.try_self_update('public.academic_evidence', '49000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update academic evidence');
select is(pg_temp.try_self_update('public.applications', '40000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update applications');
select is(pg_temp.try_self_update('public.application_events', '41000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update application events');
select is(pg_temp.try_self_update('public.program_recommendations', '42000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update recommendations');
select is(pg_temp.try_self_update('public.student_checklist_items', '43000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update checklist');
select is(pg_temp.try_self_update('public.student_document_requirements', '44000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update document requirements');
select is(pg_temp.try_self_update('public.student_dossier_messages', '45000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update dossier messages');
select is(pg_temp.try_self_update('public.student_history', '46000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update history');
select is(pg_temp.try_self_update('public.student_language_course_selections', '47000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update language selection');
select is(pg_temp.try_self_update('public.student_procedures', '48000000-0000-0000-0000-000000000001'), 0, 'prospect cannot update procedures');

select is(pg_temp.try_delete('public.academic_evidence', '49000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete academic evidence');
select is(pg_temp.try_delete('public.applications', '40000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete applications');
select is(pg_temp.try_delete('public.application_events', '41000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete application events');
select is(pg_temp.try_delete('public.program_recommendations', '42000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete recommendations');
select is(pg_temp.try_delete('public.student_checklist_items', '43000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete checklist');
select is(pg_temp.try_delete('public.student_document_requirements', '44000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete document requirements');
select is(pg_temp.try_delete('public.student_dossier_messages', '45000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete dossier messages');
select is(pg_temp.try_delete('public.student_history', '46000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete history');
select is(pg_temp.try_delete('public.student_language_course_selections', '47000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete language selection');
select is(pg_temp.try_delete('public.student_procedures', '48000000-0000-0000-0000-000000000001'), 0, 'prospect cannot delete procedures');

select throws_ok(
  $$insert into public.academic_evidence (student_id, evidence_type, origin) values ('10000000-0000-0000-0000-000000000001', 'conditional_admission', 'student_declared')$$,
  '42501', 'prospect cannot insert academic evidence'
);
select throws_ok(
  $$insert into public.applications (student_id, program_id, intake) values ('10000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'summer')$$,
  '42501', 'prospect cannot insert applications'
);
select throws_ok(
  $$insert into public.application_events (application_id, event_type) values ('40000000-0000-0000-0000-000000000001', 'prospect_attempt')$$,
  '42501', 'prospect cannot insert application events'
);
select throws_ok(
  $$insert into public.program_recommendations (student_id, program_id, admin_id) values ('10000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004')$$,
  '42501', 'prospect cannot insert recommendations'
);
select throws_ok(
  $$insert into public.student_checklist_items (student_id, title) values ('10000000-0000-0000-0000-000000000001', 'prospect attempt')$$,
  '42501', 'prospect cannot insert checklist items'
);
select throws_ok(
  $$insert into public.student_document_requirements (student_id, requirement_key, label, category) values ('10000000-0000-0000-0000-000000000001', 'prospect-attempt', 'Attempt', 'other')$$,
  '42501', 'prospect cannot insert document requirements'
);
select throws_ok(
  $$insert into public.student_dossier_messages (student_id, sender_id, sender_role, body) values ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'student', 'Prospect attempt')$$,
  '42501', 'prospect cannot insert dossier messages'
);
select throws_ok(
  $$insert into public.student_history (student_id, event_type, message) values ('10000000-0000-0000-0000-000000000001', 'prospect_attempt', 'Attempt')$$,
  '42501', 'prospect cannot insert history'
);
select throws_ok(
  $$insert into public.student_language_course_selections (student_id, language_course_id) values ('10000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001')$$,
  '42501', 'prospect cannot insert language selection'
);
select throws_ok(
  $$insert into public.student_procedures (student_id, procedure_template_key, procedure_template_version, route_key) values ('10000000-0000-0000-0000-000000000001', 'prospect-attempt', 1, 'attempt')$$,
  '42501', 'prospect cannot insert procedures'
);

-- Prospect pre-dossier access remains owner-scoped.
select is((select count(*) from public.documents), 1::bigint, 'prospect can read only own documents');
select is((select count(*) from public.student_intake_cases), 1::bigint, 'prospect can read only own intake');
select is((select count(*) from public.student_projects), 1::bigint, 'prospect can read only own project');
select is((select count(*) from storage.objects where bucket_id = 'student-documents'), 1::bigint, 'prospect can read only own storage path');
select lives_ok(
  $$insert into public.documents (student_id, storage_path, original_filename, mime_type, size_bytes, uploaded_by) values ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001/new.pdf', 'new.pdf', 'application/pdf', 100, '10000000-0000-0000-0000-000000000001')$$,
  'prospect can insert an own pending document'
);
select throws_ok(
  $$insert into public.documents (student_id, storage_path, original_filename, mime_type, size_bytes, uploaded_by) values ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002/foreign.pdf', 'foreign.pdf', 'application/pdf', 100, '10000000-0000-0000-0000-000000000001')$$,
  '42501', 'prospect cannot insert another user document'
);
select is(pg_temp.try_self_update('public.student_projects', '31000000-0000-0000-0000-000000000001'), 1, 'prospect can update own project');
select throws_ok(
  $$update public.student_projects set student_id = '10000000-0000-0000-0000-000000000002' where id = '31000000-0000-0000-0000-000000000001'$$,
  '42501', 'prospect cannot move project ownership'
);
select lives_ok(
  $$insert into storage.objects (bucket_id, name) values ('student-documents', '10000000-0000-0000-0000-000000000001/new.pdf')$$,
  'prospect can insert an own storage path'
);
select throws_ok(
  $$insert into storage.objects (bucket_id, name) values ('student-documents', '10000000-0000-0000-0000-000000000002/foreign.pdf')$$,
  '42501', 'prospect cannot insert another user storage path'
);
reset role;

-- Client A can see every own client-domain row and no Client B row.
select pg_temp.set_actor('10000000-0000-0000-0000-000000000002');
set local role authenticated;
select is((select count(*) from public.academic_evidence), 1::bigint, 'client A sees only own academic evidence');
select is((select count(*) from public.applications), 1::bigint, 'client A sees only own applications');
select is((select count(*) from public.application_events), 1::bigint, 'client A sees only own application events');
select is((select count(*) from public.program_recommendations), 1::bigint, 'client A sees only own recommendations');
select is((select count(*) from public.student_checklist_items), 1::bigint, 'client A sees only own checklist');
select is((select count(*) from public.student_document_requirements), 1::bigint, 'client A sees only own document requirements');
select is((select count(*) from public.student_dossier_messages), 1::bigint, 'client A sees only own messages');
select is((select count(*) from public.student_history), 1::bigint, 'client A sees only own history');
select is((select count(*) from public.student_language_course_selections), 1::bigint, 'client A sees only own language selection');
select is((select count(*) from public.student_procedures), 1::bigint, 'client A sees only own procedures');
select is(pg_temp.try_self_update('public.applications', '40000000-0000-0000-0000-000000000003'), 0, 'client A cannot update client B application');
select is(pg_temp.try_delete('public.student_language_course_selections', '47000000-0000-0000-0000-000000000003'), 0, 'client A cannot delete client B language selection');
select lives_ok(
  $$insert into public.student_dossier_messages (student_id, sender_id, sender_role, body) values ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'student', 'Client A own message')$$,
  'client A can insert an own dossier message'
);
select throws_ok(
  $$insert into public.student_dossier_messages (student_id, sender_id, sender_role, body) values ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'student', 'Cross account attempt')$$,
  'P0001', 'client A cannot insert a message for client B'
);
reset role;

-- Admin role alone is insufficient; AAL2 is required by the shared RLS helper.
select pg_temp.set_actor('10000000-0000-0000-0000-000000000004', 'aal1');
set local role authenticated;
select is((select count(*) from public.academic_evidence), 0::bigint, 'admin AAL1 cannot read client data');
select is((select count(*) from public.applications), 0::bigint, 'admin AAL1 cannot read applications');
select is((select count(*) from public.student_dossier_messages), 0::bigint, 'admin AAL1 cannot read messages');
reset role;

select pg_temp.set_actor('10000000-0000-0000-0000-000000000004', 'aal2');
set local role authenticated;
select is((select count(*) from public.academic_evidence), 3::bigint, 'admin AAL2 reads academic evidence');
select is((select count(*) from public.applications), 3::bigint, 'admin AAL2 reads applications');
select is((select count(*) from public.application_events), 3::bigint, 'admin AAL2 reads application events');
select is((select count(*) from public.program_recommendations), 3::bigint, 'admin AAL2 reads recommendations');
select is((select count(*) from public.student_checklist_items), 3::bigint, 'admin AAL2 reads checklist');
select is((select count(*) from public.student_document_requirements), 3::bigint, 'admin AAL2 reads document requirements');
select is((select count(*) from public.student_dossier_messages), 4::bigint, 'admin AAL2 reads dossier messages');
select is((select count(*) from public.student_history), 3::bigint, 'admin AAL2 reads history');
select is((select count(*) from public.student_language_course_selections), 3::bigint, 'admin AAL2 reads language selections');
select is((select count(*) from public.student_procedures), 3::bigint, 'admin AAL2 reads procedures');
select lives_ok(
  $$insert into public.student_history (student_id, actor_id, event_type, message) values ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'admin_rls_test', 'AAL2 admin write')$$,
  'admin AAL2 retains intended write access'
);
reset role;

-- Service-role behavior is checked explicitly only as a trusted server boundary.
set local role service_role;
select is((select count(*) from public.academic_evidence), 3::bigint, 'service role bypasses academic evidence RLS');
select is((select count(*) from public.applications), 3::bigint, 'service role bypasses application RLS');
reset role;

select * from finish();
rollback;
