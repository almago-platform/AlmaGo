# Catalogue RLS read boundary — proposal only

**Status:** PROPOSAL — **NOT APPLIED**  
**Date:** 25 September 2026  
**Issue:** #183  
**Related:** #176, #177, #178, #180

## Goal

Replace the current broad authenticated catalogue reads with a row-level boundary that preserves two distinct needs:

1. **Discovery / orientation:** a student should only receive catalogue rows that are genuinely publishable.
2. **History:** a student must keep enough programme and university context for an application they already own, even if that catalogue row later becomes inactive or loses verification.

Admins must keep complete catalogue access, including inactive and historical rows.

This document is deliberately **not** a migration. Nothing in this proposal is applied to Supabase until a separate explicit review authorizes the database change.

## Current live state verified read-only

Current policies:

- `programs authenticated read`: `SELECT TO authenticated USING (true)`
- `catalog authenticated read`: `SELECT TO authenticated USING (true)`
- admin write policies remain restricted by `public.is_admin()`

Current application expectations:

- student orientation and dashboard already filter recommendations with `isPublishableProgram`;
- creation of a student application refuses a recommendation whose programme is no longer publishable;
- student application history still joins `programs(name, degree_level, universities(name, city))`;
- admin pages require full access to active and inactive catalogue rows.

Therefore a policy such as `programs.is_active = true` alone would break legitimate historical candidature context.

## Database-visible publishability rule

For student discovery, a programme is readable when all of the following are true:

- programme `is_active = true`;
- parent university `is_active = true`;
- programme `verified_at is not null`;
- at least one of `source_url` or `application_url` looks like an HTTP(S) URL.

The database can only perform a structural URL check. The application remains responsible for stronger URL parsing and presentation rules.

## Historical exception

A student may also read:

- a programme referenced by one of **their own** applications;
- an inactive university that is the parent of a programme referenced by one of **their own** applications.

This exception is read-only. It does not make the row publishable again and does not permit creating a new application from it.

## Why private SECURITY DEFINER helpers are recommended

A direct `programs -> universities` policy combined with a `universities -> programs/applications` historical exception risks recursive RLS evaluation.

The repository already uses the reviewed pattern:

- privileged lookup in `private`;
- `SECURITY DEFINER`;
- fixed `search_path`;
- execute revoked from `public, anon`;
- execute granted only to `authenticated`;
- private schema is not exposed by the Data API.

Supabase documentation also recommends keeping security-definer helpers outside exposed schemas and using RLS as the row boundary.

## Candidate SQL — DO NOT APPLY

The following is a review candidate only.

```sql
-- PROPOSAL ONLY — DO NOT APPLY WITHOUT EXPLICIT DATABASE REVIEW.

create or replace function private.can_student_read_program(target_program_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.user_roles r
      where r.user_id = auth.uid()
        and r.role = 'student'
    )
    and exists (
      select 1
      from public.programs p
      join public.universities u on u.id = p.university_id
      where p.id = target_program_id
        and (
          (
            p.is_active = true
            and u.is_active = true
            and p.verified_at is not null
            and (
              coalesce(p.source_url, '') ~* '^https?://[^[:space:]]+$'
              or coalesce(p.application_url, '') ~* '^https?://[^[:space:]]+$'
            )
          )
          or exists (
            select 1
            from public.applications a
            where a.student_id = auth.uid()
              and a.program_id = p.id
          )
        )
    );
$$;

revoke execute on function private.can_student_read_program(uuid) from public, anon;
grant execute on function private.can_student_read_program(uuid) to authenticated;

create or replace function private.can_student_read_university(target_university_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.user_roles r
      where r.user_id = auth.uid()
        and r.role = 'student'
    )
    and exists (
      select 1
      from public.universities u
      where u.id = target_university_id
        and (
          u.is_active = true
          or exists (
            select 1
            from public.programs p
            join public.applications a on a.program_id = p.id
            where p.university_id = u.id
              and a.student_id = auth.uid()
          )
        )
    );
$$;

revoke execute on function private.can_student_read_university(uuid) from public, anon;
grant execute on function private.can_student_read_university(uuid) to authenticated;

drop policy if exists "programs authenticated read" on public.programs;
create policy "programs role-aware read"
on public.programs
for select
to authenticated
using (
  (select public.is_admin())
  or (select private.can_student_read_program(id))
);

drop policy if exists "catalog authenticated read" on public.universities;
create policy "universities role-aware read"
on public.universities
for select
to authenticated
using (
  (select public.is_admin())
  or (select private.can_student_read_university(id))
);
```

## Expected behavior matrix

| Actor / case | Programme | University |
| --- | --- | --- |
| Admin, active or inactive | readable | readable |
| Student, publishable programme | readable | readable |
| Student, inactive programme with no own application | hidden | parent follows university rule |
| Student, unverified programme with no own application | hidden | parent follows university rule |
| Student, programme under inactive university with no own application | hidden | inactive university hidden |
| Student, own historical application to inactive/unverified programme | readable for history | readable for history |
| Authenticated user without student/admin role | hidden | hidden |

## Application compatibility checks

Before any migration is approved:

1. `/student/orientation` must keep filtering with `isPublishableProgram`.
2. `POST /api/student/applications` must continue rejecting non-publishable programmes.
3. `/student/applications` must still receive programme + university names for existing applications after catalogue deactivation.
4. Student dashboard must still show programme names for existing applications.
5. Admin catalogue, orientation and application pages must still read complete inactive/history rows.
6. A non-publishable recommendation may remain readable as a recommendation row, but its nested programme must not become a new application path.

## Database verification plan

Use a non-production branch or an explicitly approved transaction-based test first.

Required cases:

- admin reads inactive programme and inactive university;
- student reads publishable programme;
- student cannot directly read inactive/unverified programme without an application;
- student can read the programme and university behind their own historical application;
- another student cannot read that historical programme through the first student's application;
- unknown authenticated role reads neither table;
- recommendation with hidden programme cannot create an application;
- no recursive-policy error occurs.

After successful functional tests:

- run Security Advisor;
- run Performance Advisor;
- inspect `EXPLAIN` for catalogue reads;
- run authenticated Student/Admin E2E;
- rerun PR CI and Browser Quality.

## Rollback candidate

If the future migration causes unexpected behavior, restore the existing read policies:

```sql
drop policy if exists "programs role-aware read" on public.programs;
create policy "programs authenticated read"
on public.programs for select to authenticated using (true);

drop policy if exists "universities role-aware read" on public.universities;
create policy "catalog authenticated read"
on public.universities for select to authenticated using (true);
```

Rollback restores the current exposure and therefore is only an operational escape hatch, not the desired final security posture.
