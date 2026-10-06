drop policy "academic evidence admin manage" on public.academic_evidence;
create policy "academic evidence admin insert" on public.academic_evidence for insert to authenticated with check ((select is_admin()));
create policy "academic evidence admin update" on public.academic_evidence for update to authenticated using ((select is_admin())) with check ((select is_admin()));
create policy "academic evidence admin delete" on public.academic_evidence for delete to authenticated using ((select is_admin()));

drop policy "application events admin write" on public.application_events;
create policy "application events admin insert" on public.application_events for insert to authenticated with check (is_admin());
create policy "application events admin update" on public.application_events for update to authenticated using (is_admin()) with check (is_admin());
create policy "application events admin delete" on public.application_events for delete to authenticated using (is_admin());

drop policy "checklist templates admin write" on public.checklist_templates;
create policy "checklist templates admin insert" on public.checklist_templates for insert to authenticated with check (is_admin());
create policy "checklist templates admin update" on public.checklist_templates for update to authenticated using (is_admin()) with check (is_admin());
create policy "checklist templates admin delete" on public.checklist_templates for delete to authenticated using (is_admin());

drop policy "documents admin delete" on public.documents;
alter policy "documents student allowed delete" on public.documents using (is_admin() or ((student_id = (select auth.uid())) and status = any(array['pending'::document_status,'rejected'::document_status,'replace_required'::document_status])));

drop policy "recommendations admin write" on public.program_recommendations;
create policy "recommendations admin insert" on public.program_recommendations for insert to authenticated with check (is_admin() and admin_id=(select auth.uid()));
create policy "recommendations admin update" on public.program_recommendations for update to authenticated using (is_admin()) with check (is_admin() and admin_id=(select auth.uid()));
create policy "recommendations admin delete" on public.program_recommendations for delete to authenticated using (is_admin());

drop policy "regulatory sources admin write" on public.regulatory_sources;
create policy "regulatory sources admin insert" on public.regulatory_sources for insert to authenticated with check (is_admin());
create policy "regulatory sources admin update" on public.regulatory_sources for update to authenticated using (is_admin()) with check (is_admin());
create policy "regulatory sources admin delete" on public.regulatory_sources for delete to authenticated using (is_admin());

drop policy "checklist admin write" on public.student_checklist_items;
create policy "checklist admin insert" on public.student_checklist_items for insert to authenticated with check (is_admin());
create policy "checklist admin update" on public.student_checklist_items for update to authenticated using (is_admin()) with check (is_admin());
create policy "checklist admin delete" on public.student_checklist_items for delete to authenticated using (is_admin());

drop policy "student procedures admin write" on public.student_procedures;
create policy "student procedures admin insert" on public.student_procedures for insert to authenticated with check ((select is_admin()));
create policy "student procedures admin update" on public.student_procedures for update to authenticated using ((select is_admin())) with check ((select is_admin()));
create policy "student procedures admin delete" on public.student_procedures for delete to authenticated using ((select is_admin()));

drop policy "student projects admin write" on public.student_projects;
create policy "student projects combined insert" on public.student_projects for insert to authenticated with check (is_admin() or student_id=(select auth.uid()));
create policy "student projects combined update" on public.student_projects for update to authenticated using (is_admin() or student_id=(select auth.uid())) with check (is_admin() or student_id=(select auth.uid()));
create policy "student projects admin delete" on public.student_projects for delete to authenticated using (is_admin());
drop policy "student projects own insert" on public.student_projects;
drop policy "student projects own update" on public.student_projects;
