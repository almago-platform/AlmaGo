-- Harden the candidate/prospect -> student data boundary.
-- A technical student role is not sufficient for client-only student data:
-- Phase 2 users receive that role at account creation while they are still prospects.
--
-- Keep the existing UI checks, but enforce the entitlement again at the database
-- boundary so direct PostgREST/API calls fail closed.

create or replace function private.has_student_client_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles role
    join public.customer_access access
      on access.user_id = role.user_id
    where role.user_id = (select auth.uid())
      and role.role = 'student'::public.app_role
      and access.status in (
        'client_active'::public.customer_lifecycle_status,
        'client_completed'::public.customer_lifecycle_status
      )
  );
$$;

revoke all on function private.has_student_client_access() from public, anon;
grant execute on function private.has_student_client_access() to authenticated, service_role;

-- Client-only student-domain policies. Admin access is intentionally preserved.
-- Shared pre-dossier resources (documents, Storage, student_intake_cases and
-- student_projects) deliberately keep their owner-scoped policies because
-- prospects legitimately use them.
drop policy if exists "academic evidence own or admin read" on public.academic_evidence;
create policy "academic evidence own or admin read"
  on public.academic_evidence for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "visible application events" on public.application_events;
create policy "visible application events"
  on public.application_events for select to authenticated
  using (
    (
      (select private.has_student_client_access())
      and visible_to_student
      and exists (
        select 1 from public.applications application
        where application.id = application_id
          and application.student_id = (select auth.uid())
      )
    )
    or (select public.is_admin())
  );

drop policy if exists "applications student or admin read" on public.applications;
create policy "applications student or admin read"
  on public.applications for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "applications controlled insert" on public.applications;
create policy "applications controlled insert"
  on public.applications for insert to authenticated
  with check (
    (select public.is_admin())
    or (
      (select private.has_student_client_access())
      and student_id = (select auth.uid())
      and status::text = 'interested'
      and intake is not null
      and submitted_at is null
      and result is null
      and reviewed_at is null
      and student_notes is null
      and coalesce(cardinality(required_documents), 0) = 0
      and (deadline is null or deadline >= (timezone('Europe/Berlin', now()))::date)
      and exists (
        select 1
        from public.program_recommendations recommendation
        join public.programs program on program.id = recommendation.program_id
        join public.universities university on university.id = program.university_id
        left join public.student_projects project on project.student_id = applications.student_id
        where recommendation.student_id = (select auth.uid())
          and recommendation.program_id = applications.program_id
          and not recommendation.is_archived
          and recommendation.status = any (array['recommended','possible','ambitious','missing_requirements'])
          and program.is_active
          and university.is_active
          and program.source_url ~* '^https?://[^[:space:]]+$'
          and program.application_url ~* '^https?://[^[:space:]]+$'
          and program.verified_at is not null
          and program.verified_at <= now()
          and applications.intake = any(program.intake_terms)
          and private.application_intake_family(applications.intake) is not null
          and applications.deadline is not distinct from case private.application_intake_family(applications.intake)
            when 'winter' then program.winter_deadline
            when 'summer' then program.summer_deadline
            else null::date
          end
          and (
            (
              private.application_intake_family(project.target_intake) is null
              and (
                select count(*)
                from unnest(program.intake_terms) candidate(term)
                where private.application_intake_family(candidate.term) is not null
              ) = 1
            )
            or (
              private.application_intake_family(project.target_intake) = private.application_intake_family(applications.intake)
              and (
                (
                  select count(*)
                  from unnest(program.intake_terms) candidate(term)
                  where private.application_intake_family(candidate.term) = private.application_intake_family(applications.intake)
                ) = 1
                or lower(btrim(project.target_intake)) = lower(btrim(applications.intake))
              )
            )
          )
      )
    )
  );

drop policy if exists "recommendations student active or admin read" on public.program_recommendations;
create policy "recommendations student active or admin read"
  on public.program_recommendations for select to authenticated
  using (
    (
      student_id = (select auth.uid())
      and (select private.has_student_client_access())
      and not is_archived
    )
    or (select public.is_admin())
  );

drop policy if exists "checklist student or admin" on public.student_checklist_items;
create policy "checklist student or admin"
  on public.student_checklist_items for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "document requirements own or admin read" on public.student_document_requirements;
create policy "document requirements own or admin read"
  on public.student_document_requirements for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "student dossier messages own or admin read" on public.student_dossier_messages;
create policy "student dossier messages own or admin read"
  on public.student_dossier_messages for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "student dossier messages student insert" on public.student_dossier_messages;
create policy "student dossier messages student insert"
  on public.student_dossier_messages for insert to authenticated
  with check (
    (select private.has_student_client_access())
    and student_id = (select auth.uid())
    and sender_id = (select auth.uid())
    and sender_role = 'student'
  );

drop policy if exists "student dossier messages student read receipt" on public.student_dossier_messages;
create policy "student dossier messages student read receipt"
  on public.student_dossier_messages for update to authenticated
  using (
    (select private.has_student_client_access())
    and student_id = (select auth.uid())
    and sender_role = 'admin'
  )
  with check (
    (select private.has_student_client_access())
    and student_id = (select auth.uid())
    and sender_role = 'admin'
  );

drop policy if exists "student history own or admin read" on public.student_history;
create policy "student history own or admin read"
  on public.student_history for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "language course selection own or admin read" on public.student_language_course_selections;
create policy "language course selection own or admin read"
  on public.student_language_course_selections for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

drop policy if exists "language course selection own insert" on public.student_language_course_selections;
create policy "language course selection own insert"
  on public.student_language_course_selections for insert to authenticated
  with check (
    (select private.has_student_client_access())
    and student_id = (select auth.uid())
  );

drop policy if exists "language course selection own or admin update" on public.student_language_course_selections;
create policy "language course selection own or admin update"
  on public.student_language_course_selections for update to authenticated
  using (
    (
      student_id = (select auth.uid())
      and (select private.has_student_client_access())
    )
    or (select public.is_admin())
  )
  with check (
    (
      student_id = (select auth.uid())
      and (select private.has_student_client_access())
    )
    or (select public.is_admin())
  );

drop policy if exists "language course selection own or admin delete" on public.student_language_course_selections;
create policy "language course selection own or admin delete"
  on public.student_language_course_selections for delete to authenticated
  using (
    (
      student_id = (select auth.uid())
      and (select private.has_student_client_access())
    )
    or (select public.is_admin())
  );

drop policy if exists "student procedures own or admin read" on public.student_procedures;
create policy "student procedures own or admin read"
  on public.student_procedures for select to authenticated
  using (
    (student_id = (select auth.uid()) and (select private.has_student_client_access()))
    or (select public.is_admin())
  );

-- Profiles are shared by prospect and client flows, so their owner policy stays available.
-- Prospect/payment/customer-access tables also remain intentionally accessible to their owner.
