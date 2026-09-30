# Phase 2 — Prospect & Access Model

Parent plan: #574  
Implementation issue: #584

## Purpose

Phase 2 adds a pre-dossier funnel in front of the existing Phase 1 client workspace:

```
visitor
→ free orientation without account
→ optional email/PDF
→ prospect without account
→ optional free account
→ qualified prospect
→ payment
→ client_active
→ existing Phase 1 dossier
```

The model deliberately separates **technical identity/role** from **commercial access**.

## Technical role vs commercial status

`user_roles.role` remains the technical authorization role:

- `student`
- `admin`

It must not be expanded with commercial states.

`customer_access.status` contains the commercial lifecycle for authenticated student accounts:

- `prospect_account`
- `qualified_prospect`
- `payment_pending`
- `paid_pending_validation`
- `client_active`
- `client_completed`

An unauthenticated prospect is **not** represented by a fake Auth user and is not a lifecycle enum value. It lives in `prospects` until the person chooses to create an account.

## Tables

### `prospects`

Minimal pre-account identity.

P2.0 stores only the fields required to establish ownership later:

- prospect id;
- email;
- optional linked `auth.users.id`;
- timestamps.

No anonymous insert/update policy exists in P2.0. Public collection is added only when P2.3 defines the consent and server-side write boundary.

### `orientations`

Versioned orientation payloads:

- prospect id;
- engine version;
- questionnaire input JSON;
- deterministic result JSON;
- timestamps.

The table is not a source of official admission decisions. Result semantics are defined by the later orientation engine.

### `customer_access`

One row per authenticated student account. It decides whether the account is still a free prospect or has client access.

Existing Phase 1 student accounts are backfilled to `client_active` to prevent accidental access loss. New Auth sign-ups receive `prospect_account`.

## Feature flag

Server flag:

`ALMAGO_PHASE2_ENABLED=true`

Default: **disabled**.

While disabled, `getPhase2StudentAccess()` preserves the current Phase 1 behavior and treats authenticated students as having client access.

When enabled, the helper reads `customer_access.status`. Only `client_active` and `client_completed` grant client-feature access.

P2.5 will apply this helper to the student shell and client-only APIs. P2.0 only establishes the boundary so the migration can be reviewed without changing the live UX.

## RLS boundary

All three Phase 2 tables have RLS enabled.

P2.0 grants authenticated users only `SELECT`:

- linked users can read their own prospect;
- linked users can read orientations owned by their prospect;
- users can read their own `customer_access`;
- admins can read these rows through the existing hardened `public.is_admin()` wrapper.

There is intentionally:

- no `anon` table access;
- no authenticated client write access;
- no browser-side service/secret key;
- no authorization based on `raw_user_meta_data`.

Anonymous prospect creation, prospect-to-account linking and lifecycle transitions require dedicated trusted server operations in later LOTs.

## Activation rule

Do not set `ALMAGO_PHASE2_ENABLED=true` in production until:

1. P2.3 public prospect collection has a reviewed consent/privacy boundary;
2. P2.4 account activation and ownership linking are implemented;
3. P2.5 server guards protect all client-only routes and APIs;
4. authenticated E2E coverage proves a prospect cannot bypass client access.

## Recovery

If work stops:

1. read #574;
2. read #584;
3. compare `phase2/p2-0-prospect-access-foundation` with current `main`;
4. keep Phase 2 isolated;
5. resume at the first unfinished P2.0 Definition of Done item.
