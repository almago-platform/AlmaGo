-- Pre-launch DB hardening with no application authorization semantic change.
-- 1) Trigger helper remains callable by the trigger, but not as a public RPC.
-- 2) Client API roles lose DDL-oriented table privileges AlmaGo never uses.
-- 3) Cover foreign keys reported by the Supabase performance advisor.

revoke execute on function public.enforce_publishable_language_course_selection()
  from public, anon, authenticated;

revoke truncate, references, trigger on all tables in schema public
  from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;

create index if not exists academic_evidence_document_student_idx
  on public.academic_evidence (document_id, student_id);

create index if not exists academic_evidence_verified_by_idx
  on public.academic_evidence (verified_by);

create index if not exists admin_notes_admin_id_idx
  on public.admin_notes (admin_id);

create index if not exists application_events_actor_id_idx
  on public.application_events (actor_id);

create index if not exists applications_program_id_idx
  on public.applications (program_id);

create index if not exists documents_reviewed_by_idx
  on public.documents (reviewed_by);

create index if not exists documents_uploaded_by_idx
  on public.documents (uploaded_by);

create index if not exists program_recommendations_admin_id_idx
  on public.program_recommendations (admin_id);

create index if not exists program_recommendations_program_id_idx
  on public.program_recommendations (program_id);

create index if not exists programs_university_id_idx
  on public.programs (university_id);

create index if not exists student_checklist_items_created_by_idx
  on public.student_checklist_items (created_by);

create index if not exists student_checklist_items_template_id_idx
  on public.student_checklist_items (template_id);

create index if not exists student_history_actor_id_idx
  on public.student_history (actor_id);

create index if not exists student_language_course_selections_course_idx
  on public.student_language_course_selections (language_course_id);

create index if not exists technical_logs_actor_id_idx
  on public.technical_logs (actor_id);
