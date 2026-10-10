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

## Also implemented behind the same OFF flag
- Existing `/prospect` layout, orientation, catalogue, roadmap and documents
  paths now render using the same ProspectShell and shared UI primitives for a
  validated temporary credential, without allowing access to Supabase
  `authenticated` or paid roles.
- Document API routes issue owner-scoped write, read (signed 60-second URL), and
  delete operations in a dedicated **private** storage bucket. Public, anonymous,
  and regular authenticated table grants are revoked. PDF/JPEG/PNG signature
  and 10 MiB checks are preserved.
- Verified `/api/orientation/claim` and verified account recovery run a
  retry-safe transfer into the confirmed candidate's normal document rows and
  storage location, then revoke provisional sessions.

## NOT READY FOR PUBLIC ACTIVATION
**Do not set `ALMAGO_PROVISIONAL_AUTH_ENABLED=true` without signed-off integration tests.**
The flag is false in `.env.example`; the existing public `/prospect-preview`
remains unchanged. This work is intentionally being reviewed in a branch.
Static tests or a passing build are not sufficient to claim the complete
registration/verification/transfer workflow works on the live Supabase stack.

## Final release requirements
1. Run **full end-to-end sign-up** with Supabase confirmations enabled: report
   PDF email → Supabase signUp → temporary session → actual `/prospect` and
   documents → cross-device login → email confirmation callback → claim →
   transferred files in the same `/prospect`.
2. Test existing verified accounts, malicious registration using somebody
   else's address, already-existing unverified accounts and collisions.
   Never attach someone else's records to a provisional principal.
3. Test stolen orientation token, CSRF/Origin, credential guessing/lockout,
   expired and revoked sessions, two-device logout, HTML/JS disguising as PDFs,
   IDOR against all document APIs and signed URLs, failed storage writes,
   retries halfway through migration and late verification at day 8+.
4. Assert all payment, proposal and Student activation endpoints independently
   refuse a provisional principal, including API calls made by hand.
   Email verification remains necessary but not sufficient for paid access.
5. Validate full local Supabase migrations and pgtap, app tests, TypeScript,
   ESLint, build, Browser Quality, authenticated E2E and A43 without altering
   production Auth/RLS settings or existing test accounts.
6. Security-review the temporary credential design, data retention and
   password/rate-limit assumptions, then approve a separate production rollout.
   Never switch the flag on before these gates; use the VPS revision gate.

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
