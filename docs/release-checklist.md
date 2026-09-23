# AlmaGo final release checklist

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
- require a successful Vercel status for the exact `main` SHA;
- publish `RELEASE GATE: READY` only when every check passes.

It never deploys, merges, changes RLS or creates users.
