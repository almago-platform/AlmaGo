# Data API student write boundary — proposal only

**Status:** PROPOSAL — **NOT APPLIED**  
**Date:** 25 September 2026  
**Issue:** #185  
**Related:** #180, #179, A43 (#84)

## Goal

Reduce the gap between AlmaGo's server routes and the direct Supabase Data API without weakening Admin capabilities or breaking onboarding.

This proposal covers two different problems:

1. **Notifications:** the student row policy is correct, but the SQL UPDATE grant is broader than the product needs.
2. **Profiles:** the student owns the row, but direct Data API writes can currently bypass the field allow-list and workflow checks enforced by AlmaGo routes.

No database change is applied by this document.

## Live state verified read-only

### Notifications

RLS:
- SELECT: own row or Admin;
- UPDATE: own row;
- INSERT: Admin only.

SQL privileges for `authenticated` currently include UPDATE on every notification column, including:
- `title`;
- `body`;
- `type`;
- `metadata`;
- `created_at`;
- `read_at`;
- `user_id`;
- `id`.

Current runtime search found no student notification UPDATE path. Notifications are currently created by database workflows for document reviews and application status changes.

### Profiles

RLS:
- INSERT: own `id`;
- SELECT: own row or Admin;
- UPDATE: own row or Admin.

The `authenticated` role currently has INSERT/UPDATE access across all profile columns.

AlmaGo routes are stricter:
- `profileUpdateFromInput()` allows only student profile fields;
- `validateProfileUpdate()` validates the application input;
- profile PATCH preserves required fields after onboarding;
- onboarding completion requires required fields and `consentAccepted = true`;
- the route writes a `profile_processing` consent before setting `onboarding_completed`;
- `full_name` is derived from first/last name by the application.

Direct Data API calls do not pass through those route checks.

## Important PostgreSQL role constraint

Both students and Admins reach Supabase as the PostgreSQL role `authenticated`.

Therefore a simple global:

```sql
revoke update (...) from authenticated;
```

cannot by itself express “student cannot change this column, but Admin can” when both actors share the same SQL role.

RLS can distinguish the user through `public.is_admin()`, but RLS controls rows, not a per-column UPDATE allow-list.

## Phase 1 — Notifications: narrow UPDATE privilege

This part is structurally simple.

The product does not currently require a student to change notification content. If/when the inbox marks a notification read, the only student-mutated column should be `read_at`.

### Candidate SQL — DO NOT APPLY

```sql
-- PROPOSAL ONLY — NOT APPLIED.

revoke update on table public.notifications from authenticated;
grant update (read_at) on table public.notifications to authenticated;
```

The existing `notifications own update` RLS policy still limits the row to `user_id = auth.uid()`.

Consequences:
- student can update only `read_at` on their own row;
- student cannot rewrite title/body/type/metadata/timestamps/user_id/id;
- Admin INSERT remains governed by the existing INSERT grant + Admin RLS policy;
- current database workflows that insert notifications are unaffected;
- if Admin notification editing is added later, that capability must be designed explicitly rather than inheriting broad UPDATE by accident.

Before applying this phase, verify PostgREST UPDATE behavior with a dedicated student and Admin test account.

## Phase 2 — Profiles: use a role-aware database invariant, not only grants

Column grants alone are not sufficient because Admin and Student share `authenticated`.

The preferred direction is a **BEFORE INSERT/UPDATE profile guard** that distinguishes Admin from non-Admin using the existing role helper and enforces protected workflow fields.

This guard should be reviewed as a database invariant, not as a replacement for the application validation layer.

### Student-editable profile fields

The database guard should permit non-Admin changes only to the fields the application intentionally accepts today:

- `first_name`
- `last_name`
- `birth_date`
- `nationality`
- `current_city`
- `phone`
- `last_diploma`
- `bac_track`
- `institution`
- `current_university_studies`
- `current_field`
- `german_level`
- `english_level`
- `french_level`
- `language_certificate`
- `language_certificate_other`
- `target_degree`
- `target_field`
- `study_language`
- `target_intake`
- `budget_range`
- `bac_year`
- `university_semesters`
- `general_average`
- `preferred_cities`

`full_name` should remain derived from first/last name rather than becoming an independent trust input.

### Protected / system fields

A non-Admin must not be able to freely rewrite:
- `id`;
- `created_at`;
- `updated_at`;
- `onboarding_completed`;
- `onboarding_completed_at`;
- legacy/internal fields not used by the current profile input contract.

### Onboarding transition

The current route must continue to work.

A safe database invariant can allow the transition `onboarding_completed: false -> true` for the owner **only when**:

1. the resulting profile contains all required onboarding fields;
2. an active `profile_processing` consent for the expected policy version exists for the same user;
3. the database sets `onboarding_completed_at` itself to the current time;
4. the row still belongs to `auth.uid()`.

The same invariant can force a new non-Admin profile row to safe workflow defaults unless the valid completion conditions are already true.

This means a direct Data API caller can only complete onboarding if the same durable business facts exist in the database. That is acceptable: the security goal is to enforce the invariant, not to require a particular HTTP route.

### Why a trigger is preferred here

A role-aware trigger can:
- preserve unrestricted Admin maintenance through `public.is_admin()`;
- preserve the current student-session server routes;
- reject protected-column tampering from direct Data API writes;
- derive/lock system fields centrally;
- avoid introducing a broad service-role path;
- avoid using a SECURITY DEFINER RPC merely to bypass RLS.

Any trigger implementation must still be separately reviewed and tested. This document does not define a production migration.

## Validation matrix before any DB change

### Notifications
- student reads own notification;
- student cannot update another user's notification;
- student can update only `read_at`;
- student cannot update title/body/type/metadata/user_id/created_at;
- Admin/document/application workflows can still insert notifications.

### Profiles
- student can edit every currently supported profile field;
- student cannot change another profile;
- student cannot forge `created_at`;
- student cannot freely set onboarding workflow fields;
- valid onboarding still completes after consent;
- onboarding without consent fails at the DB boundary;
- completed profile still cannot lose required fields if that invariant is moved into DB;
- Admin can still inspect/maintain the intended profile data;
- existing profile creation trigger remains compatible.

## Rollout order

1. A43 authenticated E2E must be green on `main`.
2. Implement and test Notifications hardening independently.
3. Re-run Security/Performance Advisors.
4. Implement the Profile invariant separately; do not combine it with the notification grant change unless review shows a clear reason.
5. Exercise direct Data API tests with dedicated test users.
6. Run Student/Admin authenticated E2E again.
7. Only then consider production migration.

## Non-goals

This proposal does not:
- enable service-role in browser/server user flows;
- publish secrets;
- change Auth settings;
- apply RLS/grants/triggers;
- claim that application validation alone is a database authorization boundary;
- add a notification inbox product feature.

