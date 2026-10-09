# AlmaGo — Prospect fast reads & independent recovery

Status: **implementation prepared in GitHub only**. This repository does **not** grant
access to the production VPS, install systemd services, provision off-site storage or
run a backup. **Do not claim a backup exists until it is verified.**

## Source of truth and performance

- Supabase Auth, Postgres (RLS), and private Storage remain authoritative.
- `src/lib/orientation-engine/catalog.ts` caches only the **non-personal verified
  academic catalogue** in VPS-process memory, with a 60-second expiry, concurrent-fetch
  coalescing and defensive copies. Cache is rebuilt after a Next.js restart and
  discarded on errors. Editorial updates may take up to 60 seconds to appear.
- `getPhase2StudentAccess` uses React's **request-local** memoization, never a
  cache shared between users or HTTP requests. Student identity, role, customer
  entitlement, price/proposal and payment checks must always be authoritative.
- The hub starts intake/document reads while it fetches orientation. Bac-specific
  document summaries are computed only when the orientation has been resolved.
- PR #1035 independently moves optional university recommendations behind Suspense,
  and PR #1031 removes blocking Wikimedia lookups. Keep those PRs separate until
  their tests and production gating have succeeded.

**No student dossiers, identity documents, proposals, access tokens, purchase records
or personalised HTML are persisted as VPS snapshots by this change.** Introducing a
private snapshot cache later requires data minimization, encryption, account
revocation/invalidation, consent/legal analysis and isolation tests; adding private
data to a generic shared Next.js cache is prohibited. A second writable 'primary'
database on the VPS would require a separate migration design.

## Off-site database and Storage backup

`ops/backup-supabase-offsite.sh` implements a **manual, fail-closed** encrypted
snapshot workflow using `pg_dump`, `rclone` and `restic`.

Prerequisites (an operator must provision these on the Ubuntu VPS):

1. A **separate off-site object-storage destination**, outside the VPS and outside
   the Supabase project, reachable by `restic` and protected with encryption at
   rest plus restic's own client-side encryption. Enable versioning/immutable
   retention where supported. Choose the region and retention consistent with GDPR.
2. Read-only Supabase Postgres backup credentials with enough rights to dump all
   required application and auth schemas. Use a trusted SSL connection and
   `PGPASSFILE` with mode 0600. Confirm `pg_dump` client/server compatibility.
3. A **read-only rclone source** pointing at the Supabase Storage S3 API with coverage
   for every required bucket, including private `student-documents`. Storage SQL
   metadata is **not** the Storage object bytes. Validate the bucket inventory and
   object count as part of the initial setup.
4. Dedicated unprivileged `almago-backup` host user, protected credentials
   and a **separately mounted protected staging filesystem** at
   `/mnt/almago-backup-secure`, either tmpfs (RAM; capacity-checked) or a
   LUKS-encrypted volume whose key lifecycle the operator manages. The script
   refuses to run if this path is not a mount point. A mount-point check **alone
   cannot prove encryption**; verify the underlying volume before activation.
   Ensure sufficient capacity for a full PostgreSQL archive **plus** Storage
   object bytes. Prevent plaintext staging on the standard VPS filesystem.
   Prepare monitoring and an isolated restoration environment.
5. `RESTIC_REPOSITORY` and `RESTIC_PASSWORD_FILE`, protected from application
   users. Set `RESTIC_CACHE_DIR` to a private directory. A **new** repository
   must first be initialized by the operator using `restic init`.

Example environment-file **field names only** (DO NOT add real values to GitHub):

```ini
PGHOST=<supabase-db-host>
PGPORT=5432
PGDATABASE=postgres
PGUSER=<read-only-backup-role>
PGPASSFILE=/etc/almago/backup.pgpass
PGSSLMODE=verify-full
PGSSLROOTCERT=/etc/ssl/certs/ca-certificates.crt
RCLONE_CONFIG=/etc/almago/backup-rclone.conf
ALMAGO_STORAGE_SOURCE=supabase-storage:
RESTIC_REPOSITORY=s3:https://<offsite-endpoint>/<separate-backups-bucket>/almago
RESTIC_PASSWORD_FILE=/etc/almago/restic-password
RESTIC_CACHE_DIR=/var/lib/almago-backup/restic-cache
ALMAGO_BACKUP_TMP_DIR=/mnt/almago-backup-secure
```

Credential files should not be readable by `www-data` or the Next.js application.
When running on the VPS **after provisioning**, copy the reviewed script to a
controlled executable path and run it under the dedicated account with the
protected environment, **not** through a web route. Nothing in this repo
automatically installs or executes the script.

### Prepared systemd units (not installed)

The repository also provides `ops/systemd/almago-offsite-backup.service` and
`ops/systemd/almago-offsite-backup.timer`. After a restore drill, an authorized
VPS operator can install the backup script and these units, create the protected
`/etc/almago/backup.env`, and then enable the timer. The service runs as the
dedicated `almago-backup` user (not the web application) and limits filesystem
writes. The timer is daily with a randomized start window. Check that
`/usr/local/sbin/almago-offsite-backup` exists, all credential/config files are
readable by that service account only, and the host has enough protected
temporary space. Confirm the separate staging mount is correctly encrypted
or memory-backed and permissioned before running the service.
Verify successful execution with `systemctl status`, journal logs (without
secrets or filenames), `restic snapshots`, and a restore test.

**Committing these files neither schedules nor executes a backup.**

### Schedule and lifecycle

- First, manually prove a successful snapshot and check remote `restic snapshots`.
- Only then create a nightly systemd timer or a controlled backup scheduler; alert
  when a scheduled run is missing, incomplete, or exceeds expected age.
- Apply retention separately after a documented policy (for example seven daily,
  four weekly, six monthly snapshots), with legal holds and deletion procedures.
  Retention/prune are intentionally **not** performed by the backup script.
- Keep off-site storage credentials separate from production Supabase credentials.
  No dumps or credentials should enter the repository, CI artifacts, access logs or
  publicly reachable directories.

### Restore drill (required before activation)

1. Restore a recent encrypted snapshot with `restic restore` to a restricted
   temporary machine; check that the dump can be opened with `pg_restore --list`.
2. Restore **into an isolated nonproduction Postgres database only**; include
   schema, auth-related relations and RLS policies as appropriate.
3. Restore a sample of private Storage objects to an isolated test bucket, compare
   hashes/content and verify that they are inaccessible to an unauthorized user.
4. Confirm the recovery objectives and document success/failure. Do **not** run
   `pg_restore` against production or use production student identities in testing.
5. Rehearse data-subject deletion/retention procedures for historical backups.

## Acceptance gates

- GitHub PR CI (application tests, typecheck, lint, production build, DB auth tests).
- Multi-user authorization checks: no shared dossier cache, no RLS weakening,
  no stale proposal, payments or account activation.
- E2E authenticated tests on actual VPS and `/api/health` revision comparison.
- Measure p50/p95 of core Prospect response and catalogue before claiming improved
  real-world performance. The desired <2s first useful content is a **target**,
  not guaranteed or verified by this patch.
- Actual backups require VPS credentials, target provisioning and a successful
  restoration test; until those are done, backup status is **NOT ACTIVE**.
