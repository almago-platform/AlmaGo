# Authenticated E2E

The authenticated suite uses dedicated test identities only and must never rely on real student data.

It verifies:

- a student can authenticate and enter the student area;
- a student is redirected away from `/admin`;
- an admin test account passes the server-side admin role guard;
- the authenticated Student Space quality matrix passes;
- the authenticated Admin Space quality matrix passes.

## Configuration

Non-sensitive test emails are repository variables with safe defaults:

- student: `phase3.student.c@almago.test`
- admin: `phase3.admin.b@almago.test`

Sensitive values remain GitHub Actions Secrets:

- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`

The public Supabase URL and publishable key are already handled as repository secrets/configuration.

There is **no** `ALMAGO_AUTH_E2E_ENABLED` activation variable in the current workflow.

## Targets

`AlmaGo Authenticated E2E` supports:

- `local` — regression mode using a locally built server inside GitHub Actions;
- `render` — release-evidence mode against the canonical `https://almago-dev.onrender.com` runtime.

Render mode:

1. wakes/checks `/api/health`;
2. requires `revision` to match the first 12 characters of the workflow SHA;
3. requires `branch == main`;
4. runs student/admin isolation journeys;
5. runs the Student/Admin responsive-accessibility matrices;
6. checks Render again immediately before A43 closure;
7. re-reads current `main` and refuses closure if it moved.

During Partner-Ready, a relevant push to `main` targets **Render by default**. This is a rehearsal against the canonical runtime: it proves the exact deployed SHA and the authenticated matrices, but A43 remains open while A38 is incomplete.

Manual dispatch still exposes the explicit `render/local` choice. Probe/comment flows keep the local fallback unless a target input exists.

A successful local run is useful regression evidence but **cannot close A43**. A successful Render rehearsal before A38 is also not the final release proof; it must be replayed on the final release candidate after A38.

## A43 closure

A43 can close only when:

- the workflow ran from exact `main`;
- target is `render`;
- Render still serves the tested exact SHA;
- A38 is already complete;
- dedicated student/admin journeys and quality matrices passed.

No password or protected key should ever be written to an Issue, commit, artifact name, screenshot or chat.
