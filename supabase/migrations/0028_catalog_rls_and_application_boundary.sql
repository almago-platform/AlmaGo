-- Pre-launch catalogue trust boundary.
-- Student catalogue reads are limited to publishable records.
-- Admin keeps full catalogue visibility and writes.
-- Student application INSERT also requires an active parent university.

drop policy if exists "programs authenticated read" on public.programs;
drop policy if exists "programs admin write" on public.programs;

create policy "programs publishable or admin read"
on public.programs
for select to authenticated
using (
  public.is_admin()
  or (
    programs.is_active
    and programs.verified_at is not null
    and programs.verified_at <= now()
    and programs.source_url ~* '^https?://[^[:space:]]+$'
    and programs.application_url ~* '^https?://[^[:space:]]+$'
    and exists (
      select 1
      from public.universities university
      where university.id = programs.university_id
        and university.is_active
    )
  )
);

create policy "programs admin insert"
on public.programs
for insert to authenticated
with check (public.is_admin());

create policy "programs admin update"
on public.programs
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "programs admin delete"
on public.programs
for delete to authenticated
using (public.is_admin());

drop policy if exists "catalog authenticated read" on public.universities;
drop policy if exists "catalog admin write" on public.universities;

create policy "catalog active or admin read"
on public.universities
for select to authenticated
using (public.is_admin() or universities.is_active);

create policy "catalog admin insert"
on public.universities
for insert to authenticated
with check (public.is_admin());

create policy "catalog admin update"
on public.universities
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "catalog admin delete"
on public.universities
for delete to authenticated
using (public.is_admin());

drop policy if exists "applications admin write" on public.applications;
drop policy if exists "applications student from recommendation" on public.applications;

create policy "applications controlled insert"
on public.applications
for insert to authenticated
with check (
  public.is_admin()
  or (
    applications.student_id = (select auth.uid())
    and applications.status::text = 'interested'
    and applications.intake is not null
    and applications.submitted_at is null
    and applications.result is null
    and applications.reviewed_at is null
    and applications.student_notes is null
    and coalesce(cardinality(applications.required_documents), 0) = 0
    and (
      applications.deadline is null
      or applications.deadline >= (timezone('Europe/Berlin', now()))::date
    )
    and exists (
      select 1
      from public.program_recommendations recommendation
      join public.programs program
        on program.id = recommendation.program_id
      join public.universities university
        on university.id = program.university_id
      left join public.student_projects project
        on project.student_id = applications.student_id
      where recommendation.student_id = (select auth.uid())
        and recommendation.program_id = applications.program_id
        and not recommendation.is_archived
        and recommendation.status in ('recommended', 'possible', 'ambitious', 'missing_requirements')
        and program.is_active
        and university.is_active
        and program.source_url ~* '^https?://[^[:space:]]+$'
        and program.application_url ~* '^https?://[^[:space:]]+$'
        and program.verified_at is not null
        and program.verified_at <= now()
        and applications.intake = any(program.intake_terms)
        and private.application_intake_family(applications.intake) is not null
        and applications.deadline is not distinct from (
          case private.application_intake_family(applications.intake)
            when 'winter' then program.winter_deadline
            when 'summer' then program.summer_deadline
            else null
          end
        )
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
            private.application_intake_family(project.target_intake)
              = private.application_intake_family(applications.intake)
            and (
              (
                select count(*)
                from unnest(program.intake_terms) candidate(term)
                where private.application_intake_family(candidate.term)
                  = private.application_intake_family(applications.intake)
              ) = 1
              or lower(btrim(project.target_intake)) = lower(btrim(applications.intake))
            )
          )
        )
    )
  )
);

create policy "applications admin update"
on public.applications
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "applications admin delete"
on public.applications
for delete to authenticated
using (public.is_admin());

alter policy "applications student or admin read"
on public.applications
using (
  applications.student_id = (select auth.uid())
  or public.is_admin()
);
