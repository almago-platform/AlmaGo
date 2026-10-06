# AlmaGo final release checklist

V3.2 design freeze is a visual/product-system baseline only. It does **not** mean public launch, payment activation, legal approval, or A45 completion. See `docs/product-system-v3-2-freeze.md`.

A45 is the last publication gate. It must not be completed before A38, A43 and A44.

## Human prerequisites

- A38 legal/privacy content reviewed by a human.
- A43 authenticated student/admin E2E green with dedicated test-only accounts.
- A44 observability/analytics activated with the telemetry allow-list and privacy review completed.

## Automated release gate

Run **AlmaGo Final Release Gate** manually from GitHub Actions and type `RELEASE`.

The workflow must:

- verify A38, A43 and A44 are completed in the Master Plan issue state;
- reject high/critical production dependency vulnerabilities via `npm audit --omit=dev --audit-level=high`;
- run unit/security/business tests;
- run TypeScript, lint and production build;
- run public Playwright responsive/accessibility tests;
- run authenticated student/admin isolation tests;
- require the canonical Render service to report the exact shortened `main` SHA from `/api/health`;
- smoke `/`, `/login` and `/signup` on `https://almago-dev.onrender.com`;
- publish `RELEASE GATE: READY` only when every check passes and Render serves the exact `main` revision.

It never deploys, merges, changes RLS or creates users.


## Canonical runtime evidence

A45 treats Render as the publication runtime. The gate must not accept a healthy but stale deployment.

The required runtime proof is:

- `https://almago-dev.onrender.com/api/health` responds successfully;
- its `revision` equals the first 12 characters of the exact `main` SHA captured at gate start;
- its `branch` is `main`;
- public root, login and signup routes answer successfully;
- `main` is revalidated immediately before A45 is marked ready.

The gate tolerates a bounded Render Free cold start. It does not trigger a deployment, upgrade a plan, merge code or change production configuration.
