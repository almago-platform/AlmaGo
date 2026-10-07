create index if not exists student_case_assignments_assigned_by_idx
  on public.student_case_assignments (assigned_by);

create index if not exists student_case_notes_author_id_idx
  on public.student_case_notes (author_id);

create index if not exists student_checklist_items_procedure_step_template_id_idx
  on public.student_checklist_items (procedure_step_template_id);

create index if not exists student_document_requirements_created_by_idx
  on public.student_document_requirements (created_by);

create index if not exists student_document_requirements_document_id_idx
  on public.student_document_requirements (document_id);

create index if not exists student_dossier_messages_sender_id_idx
  on public.student_dossier_messages (sender_id);
