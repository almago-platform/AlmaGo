# NULL-safe application uniqueness — proposal only

**Status:** PROPOSAL — **NOT APPLIED**  
**Date:** 25 September 2026  
**Issue:** #182  
**Related:** #177, #178

## Goal

Guarantee the business rule:

> one application per student + programme + intake

even when `intake IS NULL`.

The current application route already performs an explicit pre-insert lookup for both a known intake and `intake IS NULL`, but an application-level check cannot eliminate concurrent-request races or alternate authorized write paths.

No database migration is applied by this document.

## Live state verified read-only

Supabase currently runs PostgreSQL **17.6**.

Current constraint:

```sql
UNIQUE (student_id, program_id, intake)
```

Current data:
- applications total: **0**;
- applications with `intake IS NULL`: **0**;
- duplicate groups by `student_id + program_id + intake`: **0**.

No data cleanup is currently required before a future constraint replacement.

## Why the existing constraint is insufficient

PostgreSQL UNIQUE constraints treat NULL values as distinct by default.

Therefore two rows such as:

```text
same student_id
same program_id
intake = NULL
```

can coexist under the current constraint.

PostgreSQL 17 supports `UNIQUE NULLS NOT DISTINCT`, which makes NULL values compare as equivalent for uniqueness.

Official PostgreSQL 17 reference:
https://www.postgresql.org/docs/17/sql-altertable.html

## Preferred future constraint

For AlmaGo's current PostgreSQL version, the clearest native representation is:

```sql
UNIQUE NULLS NOT DISTINCT (student_id, program_id, intake)
```

This preserves the existing behavior for non-null intakes while closing the NULL duplicate case.

## Candidate migration — DO NOT APPLY

```sql
-- PROPOSAL ONLY — DO NOT APPLY WITHOUT EXPLICIT DATABASE REVIEW.

begin;

-- Preflight must return zero rows before the constraint is replaced.
select student_id, program_id, intake, count(*) as row_count
from public.applications
group by student_id, program_id, intake
having count(*) > 1;

alter table public.applications
  drop constraint applications_student_id_program_id_intake_key;

alter table public.applications
  add constraint applications_student_id_program_id_intake_key
  unique nulls not distinct (student_id, program_id, intake);

commit;
```

If the preflight returns any duplicate group in the future, do not drop/replace the constraint until those rows have been reviewed explicitly.

## Application behavior to keep

The route-level duplicate lookup should remain even after the DB constraint is hardened.

Reasons:
- it produces a clean 409 before attempting an insert in the common case;
- it handles both known intake and NULL intake explicitly;
- the DB constraint remains the final concurrency-safe backstop;
- the route already converts PostgreSQL error `23505` to the same user-facing 409.

This is defense in depth, not duplicated business logic to remove.

## Concurrency behavior

After the future constraint replacement:

1. two concurrent requests may both pass the route's preflight;
2. one insert wins;
3. the other insert receives unique violation `23505`;
4. AlmaGo returns HTTP 409 instead of creating a duplicate.

That is the desired race-safe behavior.

## Validation matrix before production migration

- known intake: first application succeeds;
- same known intake: duplicate is rejected;
- different known intake for same programme: allowed when product semantics permit it;
- NULL intake: first application succeeds;
- second NULL intake for same student/programme: rejected;
- concurrent double-submit for NULL intake: exactly one row persists;
- another student may create their own application for the same programme/intake;
- route still maps `23505` to 409;
- #178 RLS creation boundary remains compatible;
- authenticated Student/Admin E2E passes after A43.

## Rollback candidate

If the future constraint itself causes an unexpected compatibility issue, the structural rollback is:

```sql
alter table public.applications
  drop constraint applications_student_id_program_id_intake_key;

alter table public.applications
  add constraint applications_student_id_program_id_intake_key
  unique (student_id, program_id, intake);
```

Rollback would restore the known NULL-duplicate weakness, so it is an emergency compatibility fallback rather than the desired final state.

