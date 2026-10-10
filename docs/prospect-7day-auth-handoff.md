# #1071 — Seven-day unverified candidate authentication (implementation handoff)

## Requested contract
After public orientation and emailed PDF, a candidate enters first name, surname,
email and password. They may continue immediately in the **existing** /prospect
space on the first browser or sign in from a second browser with the same credentials
for at most seven days. The email confirmation sent by **Supabase Auth** is a
separate proof of inbox ownership, required before commercial/payment activation.
The orientation, account and private documents must remain intact after verification.

## What this draft introduces (feature OFF)
- `provisional_candidate_credentials`: password-derived secret and exact orientation
  association. It is NOT an `auth.users` account and does not prove email ownership.
- `provisional_candidate_sessions`: opaque 256-bit cookies, SHA-256 digests at rest,
  DB expiration and revocation, one session per device with a common credential.
- `/api/provisional-session/start`, `login`, `logout` guarded by
  `ALMAGO_PROVISIONAL_AUTH_ENABLED`, the existing Phase 2 gates, same-origin
  POST requests, identity checks and throttling.
- `AuthForm` optionally requests a provisional session **only after** Supabase
  `signUp` did not issue a verified session. Supabase's confirmation email remains
  unchanged. Normal verified login and orientation claim remain unchanged.
- No mutation to existing `auth.users`, RLS policies, paid lifecycle, storage buckets
  or old student/admin accounts.

## NOT READY FOR PUBLIC ACTIVATION
**Do not set `ALMAGO_PROVISIONAL_AUTH_ENABLED=true`.** The flag remains false
in `.env.example`, and this PR intentionally does NOT grant the temporary
principal authenticated access to protected Supabase tables or APIs.
While the feature is disabled the existing `/prospect-preview` path stays in place.
Enabling the flag before completing the next steps would redirect temporary
sessions to `/prospect` without a supported dashboard session.

## Required next implementation and review
1. Define a single /prospect authorization seam that accepts an authenticated
   Supabase user OR a verified *provisional session*. The two entitlements must
   never be confused. Reuse the actual ProspectShell/dashboard components.
2. Build **provisional-only document storage** with strict owner checks using the
   pending credential ID. NEVER use the shared student-documents bucket or insert
   into student-owned tables through a service-role client without explicit,
   tested per-object authorization. Preserve file signature checks, 10 MiB cap,
   private URLs and 60-second signed downloads.
3. On Supabase email confirmation and successful atomic orientation claim,
   verify exact prospect/orientation and email, migrate pending document metadata
   and private objects to the confirmed user transactionally or with retry-safe
   reconciliation, mark the credential consumed, revoke all provisional sessions
   and keep the same /prospect URL. Never infer ownership from email alone.
4. Add hard server-side blocks for proposal acceptance, messaging attachments
   requiring identity, payments, Student activation and all other privileged
   mutations. The **email confirmation is necessary but not sufficient** to
   activate a commercial entitlement.
5. Test authenticated existing accounts, same-browser signup, another device,
   failed passwords and locks, expiry at day 7, logout and revocation, stolen
   orientation token, repeated signup, email collision with an existing Supabase
   account, leaked cookie, DB RLS/storage IDOR, delayed confirmation, file migration,
   admin AAL2 and the existing A43 suite.
6. Only then run full Supabase-local DB tests, npm test, TypeScript, lint, build,
   Browser Quality and authenticated E2E; review and explicitly approve a separate
   rollout. Use the VPS revision gate to verify production.

## Security invariants
- A real email typed in a form does not prove inbox control or identity.
- A valid orientation bearer token only authorizes that specific orientation,
  not an existing verified account, previous orientations or private documents.
- All personally identifying claims from a browser are untrusted until the
  server validates the token/session and exact record ownership.
- One SQL and storage boundary per candidate; no email-based writes and no
  generic service-role `supabase` client handed to React screens.
- Production CSRF checks require a configured `SITE_URL`, and cookies use
  `__Host-`, Secure and HttpOnly.
- Feature gates must fail closed and existing RLS/user roles must never be
  relaxed as a shortcut.
