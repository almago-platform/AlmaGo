# Partner-Ready Security Review

Review scope: Partner-Ready pre-launch environment and synthetic demonstration only.

## Verified controls

### Application and dependency baseline

- Next.js is pinned to **16.3.8**.
- The canonical PR CI after the targeted patch reports **0 dependency vulnerabilities** during `npm ci`.
- The patch did not use `npm audit fix --force` and did not mix unrelated dependency upgrades.
- Admin routes and critical admin APIs derive the connected identity from Supabase Auth and independently verify the `user_roles` admin role.
- Student/admin role-isolation E2E is part of the Partner-Ready rehearsal.

### Database / RLS

Supabase project metadata was reviewed on 2026-10-01:

- every application table in the `public` schema has RLS enabled;
- the two advisor findings with RLS enabled but no policies are:
  - `payment_provider_events`;
  - `technical_logs`.
- those two tables have no `anon` or `authenticated` table grants and are intentionally backend/service-only. No permissive policy should be added merely to silence the advisor.

Supabase remediation reference for the informational advisor:
https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

### Storage

The `student-documents` bucket is:

- private;
- limited to 10 MiB per object;
- restricted to PDF, JPEG and PNG;
- protected by authenticated Storage policies for owned upload/read/delete and admin read.

### Secrets and repository hygiene

A targeted repository scan found references/placeholders for expected environment-variable names, but no obvious committed live GitHub token, live payment key, webhook secret or private key material.

Secrets must remain environment-only. Synthetic demo credentials must stay out of the repository and partner-facing documents.

### Partner-Ready side-effect boundary

Partner-Ready mode keeps production indexing, real prospect collection, transactional-email delivery, production payments and production analytics/attribution fail-closed.

The partner payment surface is browser-only and 0 €. The email surface renders local previews and makes no delivery call.

## Supabase advisor findings

### Security action still required

Supabase currently reports **Leaked Password Protection Disabled**.

Before declaring the security checkpoint fully complete, the project owner should enable compromised-password protection in Supabase Auth if the project plan supports the feature.

Reference:
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

This is a project-level Auth setting and is not changed by a database migration.

### Performance advisories

The current advisor also reports performance items, including unindexed foreign keys, RLS init-plan optimization opportunities, unused indexes and multiple permissive policies.

These are tracked as performance/maintenance findings; they must not be “fixed” blindly during the security checkpoint because policy rewrites can change authorization semantics.

## Backup and rollback boundary

Application rollback evidence exists through Git history and Render deployment history, allowing the web runtime to be returned to a previously known application SHA.

Database migrations are not automatically rolled back destructively. Any schema rollback must use a reviewed forward migration or the platform's documented recovery mechanism.

Before **Public Live with real user data**, the owner must separately verify Supabase backup/PITR availability and retention for the selected plan.

## Current Partner-Ready security exit criteria

To close the PR-4 security portion:

- patched dependency baseline remains green;
- exact-SHA Partner-Ready rehearsal passes after the patch;
- Supabase compromised-password protection is either enabled or explicitly recorded as an owner-approved pre-Public-Live action;
- no production side-effect flag is enabled;
- no real student data or real payment is required by the demonstration.
