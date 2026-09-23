# Authenticated E2E

The authenticated suite is fully scaffolded but intentionally disabled until dedicated test accounts exist.

When enabled it verifies:

- a student can authenticate and enter the student area;
- a student is redirected away from `/admin`;
- an admin test account passes the server-side admin role guard.

It never requires real student data. Use dedicated test users only.

Activation requires the repository variable `ALMAGO_AUTH_E2E_ENABLED=true` and the six secrets documented in `docs/USER_ACTION_REQUIRED.md`.
