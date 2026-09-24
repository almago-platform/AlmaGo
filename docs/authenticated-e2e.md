# Authenticated E2E

The authenticated suite is scaffolded for dedicated test identities only.

It verifies:

- a student can authenticate and enter the student area;
- a student is redirected away from `/admin`;
- an admin test account passes the server-side admin role guard;
- the Student Space responsive/accessibility matrix;
- the Admin Space responsive/accessibility matrix.

It never requires real student data.

## Current configuration contract

The workflow uses these default test-only identities unless repository variables override them:

- student: `phase3.student.a@almago.test`
- admin: `phase3.admin@almago.test`

Optional repository variables:

- `ALMAGO_E2E_STUDENT_EMAIL`
- `ALMAGO_E2E_ADMIN_EMAIL`

Required GitHub Actions secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `ALMAGO_E2E_STUDENT_PASSWORD`
- `ALMAGO_E2E_ADMIN_PASSWORD`

For the current AlmaGo repository, the two public Supabase configuration secrets are already configured; the remaining owner action is to set the two dedicated E2E passwords privately in GitHub Actions Secrets.

There is no `ALMAGO_AUTH_E2E_ENABLED` switch in the current workflow.

When required configuration is missing, automated probe/push runs skip the authenticated journey cleanly. A manual non-probe dispatch reports the missing configuration instead of pretending the E2E passed.

After a successful authenticated run, A43 records evidence and closes automatically.
