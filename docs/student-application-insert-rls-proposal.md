# Student application INSERT RLS boundary — proposal only

**Status:** PROPOSAL — **NOT APPLIED**  
**Date:** 25 September 2026  
**Issue:** #178  
**Related:** #176, #177, #183, #180

## Goal

Bring the direct Supabase Data API INSERT boundary for `applications` in line with the already-hardened AlmaGo route.

A student must not be able to create a new application for a programme that AlmaGo would refuse as non-publishable.

No RLS, function, grant or migration is applied by this document.

## Current live policy

The current student INSERT policy requires:

- `student_id = auth.uid()`;
- `status = 'interested'`;
- an active, non-archived recommendation owned by the same student;
- recommendation status different from `not_recommended`.

It does **not** currently require:

- programme active;
- parent university active;
- programme verification timestamp;
- structural HTTP(S) source evidence.

The application route already enforces those conditions through `isPublishableProgram()`.

## Required database rule

For a new student-created application, the database should confirm all of the following:

1. the authenticated user has the AlmaGo `student` role;
2. the application row belongs to `auth.uid()`;
3. the initial application status remains `interested`;
4. a recommendation exists for the same student and programme;
5. the recommendation is not archived;
6. the recommendation is not `not_recommended`;
7. the programme is active;
8. its parent university is active;
9. `verified_at` is recorded;
10. `source_url` or `application_url` is structurally HTTP(S).

This is a creation boundary only. Existing applications must remain readable even if the catalogue row later becomes inactive or loses verification.

## Avoid a future RLS recursion

A direct policy JOIN across:

`applications -> program_recommendations -> programs -> universities`

looks simple today, but #183 proposes role-aware SELECT policies on `programs` and `universities`, including a historical exception that itself refers to `applications`.

Applying both designs naively risks a policy dependency cycle.

The safer direction is a private, narrowly-scoped `SECURITY DEFINER` predicate that validates the creation eligibility using the base tables while keeping the public policy small.

This follows the same repository pattern already used for `private.is_admin()`:
- helper in the non-exposed `private` schema;
- fixed `search_path`;
- EXECUTE revoked from `public, anon`;
- EXECUTE granted only to `authenticated`;
- RLS policy calls the helper through a `select` init plan.

## Candidate SQL — DO NOT APPLY

```sql
-- PROPOSAL ONLY — DO NOT APPLY WITHOUT EXPLICIT DATABASE REVIEW.

create or replace function private.can_student_create_application(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.user_roles role_row
      where role_row.user_id = auth.uid()
        and role_row.role = 'student'
    )
    and exists (
      select 1
      from public.program_recommendations recommendation
      join public.programs program
        on program.id = recommendation.program_id
      join public.universities university
        on university.id = program.university_id
      where recommendation.student_id = auth.uid()
        and recommendation.program_id = target_program_id
        and recommendation.is_archived = false
        and recommendation.status <> 'not_recommended'
        and program.is_active = true
        and university.is_active = true
        and program.verified_at is not null
        and (
          coalesce(program.source_url, '') ~* '^https?://[^[:space:]]+$'
          or coalesce(program.application_url, '') ~* '^https?://[^[:space:]]+$'
        )
    );
$$;

revoke execute on function private.can_student_create_application(uuid)
from public, anon;

grant execute on function private.can_student_create_application(uuid)
to authenticated;

drop policy if exists "applications student from recommendation"
on public.applications;

create policy "applications student from publishable recommendation"
on public.applications
for insert
to authenticated
with check (
  student_id = (select auth.uid())
  and status = 'interested'
  and (select private.can_student_create_application(program_id))
);
```

## Why the helper still checks the student role

Supabase maps every signed-in account to the PostgreSQL role `authenticated`. AlmaGo's product roles live in `public.user_roles`.

The helper therefore checks `role = 'student'` explicitly instead of assuming that every authenticated user who can satisfy ownership semantics is a student.

## URL boundary

The database candidate uses only a structural HTTP(S) check.

The application keeps the stronger parsing/presentation logic in `isHttpSourceUrl()`.

A database policy should not claim that an HTTP(S) URL proves the substantive correctness of a programme; `verified_at` records the review event, while the URL remains evidence to inspect.

## Compatibility requirements

Before a migration is approved:

- the normal AlmaGo application route still creates a valid `interested` application;
- an unverified programme fails through direct Data API;
- an inactive programme fails;
- a programme under an inactive university fails;
- a recommendation owned by another student fails;
- an archived or `not_recommended` recommendation fails;
- an Admin retains the existing Admin write path;
- existing applications remain readable after later catalogue deactivation;
- #183 catalogue read policies and this INSERT policy do not recurse.

## Adjacent INSERT-integrity finding

The live `authenticated` table grant currently permits INSERT across all `applications` columns.

The current RLS policy constrains owner and status, but does not by itself prove that every other initial field was derived by AlmaGo. In particular, a direct Data API caller can attempt to supply fields such as:

- `deadline`;
- `submitted_at`;
- `next_action`;
- `required_documents`;
- `student_notes`;
- `result`;
- `reviewed_at`;
- creation/update timestamps.

That concern is **not silently solved by this proposal**. It should be reviewed as a separate application-row integrity boundary so #178 remains focused and testable.

At minimum, a future review should ensure student-created rows cannot start with Admin/result workflow facts that AlmaGo did not produce.

## Validation plan

1. Wait for A43 authenticated E2E to be green on `main`.
2. Test the helper/policy on a non-production branch or explicitly approved transaction.
3. Exercise direct Data API INSERTs with dedicated student/admin test identities.
4. Test all failure cases listed above.
5. Test #183-compatible programme/university reads.
6. Run Security Advisor and Performance Advisor.
7. Run authenticated Student/Admin E2E.
8. Only then review a production migration.

