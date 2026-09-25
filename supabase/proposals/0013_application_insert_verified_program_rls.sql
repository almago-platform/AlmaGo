-- PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY.
-- Issue #178: align student application INSERT RLS with AlmaGo publishability rules.
--
-- This file intentionally lives under supabase/proposals/, not supabase/migrations/.
-- Before any production application:
--   1. run the read-only preflight queries in the issue;
--   2. review existing SELECT/INSERT policies and grants;
--   3. validate with dedicated authenticated E2E accounts;
--   4. run Supabase Security + Performance Advisors;
--   5. obtain explicit approval for the protected DB change.

drop policy if exists "applications student from recommendation" on public.applications;

create policy "applications student from verified recommendation" on public.applications
  for insert to authenticated
  with check (
    student_id = (select auth.uid())
    and status::text = 'interested'
    and exists (
      select 1
      from public.program_recommendations recommendation
      join public.programs program
        on program.id = recommendation.program_id
      join public.universities university
        on university.id = program.university_id
      where recommendation.student_id = (select auth.uid())
        and recommendation.program_id = applications.program_id
        and not recommendation.is_archived
        and recommendation.status <> 'not_recommended'
        and program.is_active
        and university.is_active
        and program.verified_at is not null
        and (
          nullif(trim(program.source_url), '') ~* '^https?://'
          or nullif(trim(program.application_url), '') ~* '^https?://'
        )
    )
  );

-- No grants, table structure, existing rows, or other policies are modified here.
