# AlmaGo — Admin document access and storage performance rollout

## Current storage and safeguards

Student dossier documents remain in private Supabase Storage bucket `student-documents`. The `documents` table contains object paths and review metadata. Uploads remain limited to PDF, JPEG and PNG, 10 MiB. There is **no document-file migration to the OVH VPS in this change**.

## Stage 1 — safe optimization (this PR)

- New `GET /api/admin/documents/:id/view` explicitly requires `getAdminUser()`, including the admin MFA assurance check; it uses the authenticated RLS-scoped Supabase client to issue a 60-second signed URL.
- Student opening stays on `GET /api/documents/:id/view` with its existing client-entitlement guard.
- Admin queue and document requirements use the admin-only route.
- Admin queue mounts at most 25 cards at a time; total-count badges still count the full fetched queue. This is **client-side rendering pagination**, not database query pagination.
- Admin document response includes `Server-Timing` for document metadata lookup and signed URL creation, with `Cache-Control: private, no-store`.
- Optional `ALMAGO_ADMIN_DOCUMENT_PERF_LOG_ENABLED=true` logs only aggregate row counts and duration figures on the admin documents page; it must never log filenames, student IDs, object paths, signed URLs, or document contents.

## Stage 2 — measure before adding disk copies

Measure the admin queue render/load time and signed-link/document-download latency with several representative PDF/image sizes and realistic account permissions. Compare cold and warm opens. Distinguish browser/network download time from API lookup/signing. The timer is not evidence that the browser downloaded a file quickly.

If DB query size grows, implement genuine server-side paging of **latest current document per student/category**, preserving semantics and RLS, rather than silently truncating a `.range()` of ungrouped historical rows. Migration and deployment sequencing must be tested before relying on any new DB view/function.

## Stage 3 — optional OVH private cache (not yet enabled)

Only if real-world measurements show benefit:

1. Keep Supabase Storage as the canonical source of file bytes. A VPS cache is disposable, never the only remaining copy.
2. Require a valid session and the correct admin/owner entitlement before accessing every cached object. Do not expose the cache via Nginx `/public`, static web roots, file-path input, predictable public URLs, or unauthenticated redirects.
3. Use an encrypted-at-rest private cache directory outside the Git repository and deployment releases, owner-only permissions, opaque object keys and a small bounded quota. Never cache signed URLs as permanent identifiers.
4. Validate source identity/version and use atomic writes, content integrity checks, TTL/eviction, and automatic fallbacks to Supabase on misses/failure.
5. Invalidate cached bytes on document replacement, deletion, account deletion and access revocation. Support audited GDPR/INPDP lifecycle controls and applicable Tunisian data-transfer requirements.
6. Before enabling, run isolated auth/IDOR tests, restart/rollback tests, source-of-truth consistency checks and destructive-delete tests. Use an explicit disabled-by-default feature flag.

## Backup / recovery distinction

A cache is **not a backup**. Supabase database backups do not automatically guarantee recovery of Storage object bytes. File recovery needs an independent encrypted backup strategy with retention, deletion propagation, verification and periodic restore drills. Do not claim such a backup exists until one is configured and tested.

## Rollout

Use PR review/CI, do **not** merge directly to `main` until checks and a real admin/regular student smoke test pass. OVH polls `main` automatically and will deploy soon after merge. Do not change production environment variables before that review.
