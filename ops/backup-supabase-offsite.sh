#!/usr/bin/env bash
# AlmaGo off-site backup: PostgreSQL + Supabase Storage object bytes.
# Run on a trusted VPS with root-managed credentials and an independent restic repository.
# IMPORTANT: this script is not installed or scheduled by committing it.
set -euo pipefail
umask 077

for command in pg_dump rclone restic mktemp; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required backup command: $command" >&2
    exit 1
  fi
done

# No DB password in command-line arguments or source control:
# supply PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSFILE via a protected EnvironmentFile.
for required in PGHOST PGDATABASE PGUSER PGPASSFILE RESTIC_REPOSITORY RESTIC_PASSWORD_FILE ALMAGO_STORAGE_SOURCE; do
  if [[ -z "${!required:-}" ]]; then
    echo "Missing required backup configuration: $required" >&2
    exit 1
  fi
done

if [[ ! -r "$PGPASSFILE" || ! -r "$RESTIC_PASSWORD_FILE" ]]; then
  echo "Backup credential files are not readable." >&2
  exit 1
fi

# Fail before starting a dump if off-site encrypted storage cannot be accessed.
restic snapshots --latest 1 --json >/dev/null

workdir="$(mktemp -d "${ALMAGO_BACKUP_TMP_DIR:-/var/tmp}/almago-offsite.XXXXXXXX")"
cleanup() { rm -rf -- "$workdir"; }
trap cleanup EXIT

# The DATABASE archive includes table data and schema. It does not include the
# actual bytes stored in Supabase Storage buckets; those are copied separately.
pg_dump --format=custom --no-owner --no-acl --file="$workdir/postgres.dump"
mkdir -p "$workdir/storage"

# ALMAGO_STORAGE_SOURCE must be a configured READ-ONLY rclone remote covering
# every private/public Supabase Storage bucket. Never use 'sync': no source deletions.
rclone copy "$ALMAGO_STORAGE_SOURCE" "$workdir/storage" --quiet

# restic encrypts locally before uploading to a SEPARATE off-site repository.
restic backup --quiet --tag almago --tag supabase -- "$workdir/postgres.dump" "$workdir/storage"
echo "Off-site encrypted PostgreSQL + Storage snapshot completed."
