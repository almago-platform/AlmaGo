alter policy "admin notes admin only" on public.admin_notes
  using (is_admin())
  with check (is_admin() and admin_id = (select auth.uid()));

alter policy "visible application events" on public.application_events
  using ((visible_to_student and exists (select 1 from public.applications a where a.id = application_events.application_id and a.student_id = (select auth.uid()))) or is_admin());

alter policy "consents own insert" on public.consents with check (user_id = (select auth.uid()));
alter policy "consents own read" on public.consents using (user_id = (select auth.uid()) or is_admin());
alter policy "consents own revoke" on public.consents using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter policy "documents student allowed delete" on public.documents
  using (student_id = (select auth.uid()) and status = any (array['pending'::document_status,'rejected'::document_status,'replace_required'::document_status]));
alter policy "documents student insert" on public.documents
  with check (student_id = (select auth.uid()) and uploaded_by = (select auth.uid()) and status='pending'::document_status and size_bytes <= 10485760 and mime_type = any(array['application/pdf'::text,'image/jpeg'::text,'image/png'::text]));
alter policy "documents student or admin read" on public.documents using (student_id = (select auth.uid()) or is_admin());

alter policy "notifications own read" on public.notifications using (user_id = (select auth.uid()) or is_admin());
alter policy "notifications own update" on public.notifications using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter policy "profiles own insert" on public.profiles with check (id = (select auth.uid()));
alter policy "profiles own read" on public.profiles using (id = (select auth.uid()) or is_admin());
alter policy "profiles own update" on public.profiles using (id = (select auth.uid()) or is_admin()) with check (id = (select auth.uid()) or is_admin());

alter policy "recommendations admin write" on public.program_recommendations using (is_admin()) with check (is_admin() and admin_id = (select auth.uid()));
alter policy "recommendations student active or admin read" on public.program_recommendations using ((student_id = (select auth.uid()) and not is_archived) or is_admin());

alter policy "checklist student or admin" on public.student_checklist_items using (student_id = (select auth.uid()) or is_admin());

alter policy "student history admin write" on public.student_history with check (is_admin() and actor_id = (select auth.uid()));
alter policy "student history own or admin read" on public.student_history using (student_id = (select auth.uid()) or is_admin());

alter policy "language course selection own insert" on public.student_language_course_selections with check (student_id = (select auth.uid()));
alter policy "language course selection own or admin delete" on public.student_language_course_selections using (student_id = (select auth.uid()) or is_admin());
alter policy "language course selection own or admin read" on public.student_language_course_selections using (student_id = (select auth.uid()) or is_admin());
alter policy "language course selection own or admin update" on public.student_language_course_selections using (student_id = (select auth.uid()) or is_admin()) with check (student_id = (select auth.uid()) or is_admin());

alter policy "student projects own insert" on public.student_projects with check (student_id = (select auth.uid()));
alter policy "student projects own or admin read" on public.student_projects using (student_id = (select auth.uid()) or is_admin());
alter policy "student projects own update" on public.student_projects using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));

alter policy "roles own read or admin" on public.user_roles using (user_id = (select auth.uid()) or is_admin());
