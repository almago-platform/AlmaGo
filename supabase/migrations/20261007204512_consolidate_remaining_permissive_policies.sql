drop policy if exists "document requirements admin write"
  on public.student_document_requirements;

create policy "document requirements admin insert"
  on public.student_document_requirements
  for insert
  to authenticated
  with check ((select public.is_admin()));

create policy "document requirements admin update"
  on public.student_document_requirements
  for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "document requirements admin delete"
  on public.student_document_requirements
  for delete
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "student dossier messages admin insert"
  on public.student_dossier_messages;
drop policy if exists "student dossier messages student insert"
  on public.student_dossier_messages;

create policy "student dossier messages actor insert"
  on public.student_dossier_messages
  for insert
  to authenticated
  with check (
    (
      (select public.is_admin())
      and sender_id = (select auth.uid())
      and sender_role = 'admin'
    )
    or
    (
      (select private.has_student_client_access())
      and student_id = (select auth.uid())
      and sender_id = (select auth.uid())
      and sender_role = 'student'
    )
  );

drop policy if exists "student dossier messages admin read receipt"
  on public.student_dossier_messages;
drop policy if exists "student dossier messages student read receipt"
  on public.student_dossier_messages;

create policy "student dossier messages actor read receipt"
  on public.student_dossier_messages
  for update
  to authenticated
  using (
    (
      (select public.is_admin())
      and sender_role = 'student'
    )
    or
    (
      (select private.has_student_client_access())
      and student_id = (select auth.uid())
      and sender_role = 'admin'
    )
  )
  with check (
    (
      (select public.is_admin())
      and sender_role = 'student'
    )
    or
    (
      (select private.has_student_client_access())
      and student_id = (select auth.uid())
      and sender_role = 'admin'
    )
  );
