import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const catalog = read("src/lib/orientation-engine/catalog.ts");
const auth = read("src/lib/phase2/access.ts");
const intake = read("src/lib/prospect/intake.ts");
const hub = read("src/lib/prospect/hub.ts");
const backup = read("ops/backup-supabase-offsite.sh");
const runbook = read("docs/prospect-performance-offsite-backup.md");

test("public academic cache is short-lived, process-local and read-only", () => {
  assert.match(catalog, /const CATALOGUE_CACHE_TTL_MS = 60_000/);
  assert.match(catalog, /cachedCatalogue\.expiresAt > Date\.now\(\)/);
  assert.match(catalog, /let catalogueInFlight: Promise<OrientationProgrammeRecord\[\]> \| null/);
  assert.match(catalog, /\.finally\(\(\) => \{\s*catalogueInFlight = null;/);
  assert.match(catalog, /structuredClone\(cachedCatalogue\.records\)/);
  assert.match(catalog, /structuredClone\(await catalogueInFlight\)/);
  assert.match(catalog, /createPublicCatalogSupabaseClient/);
  assert.match(catalog, /read_orientation_program_catalog/);
  assert.doesNotMatch(catalog, /createPrivilegedSupabaseClient|service_role|auth\.getUser|cookies\(/);
});

test("role and commercial entitlement are cached only per React request", () => {
  assert.match(auth, /import \{ cache \} from "react"/);
  assert.match(auth, /getPhase2StudentAccess = cache\(/);
  assert.match(auth, /getTechnicalStudentUser\(\)/);
  assert.match(auth, /\.from\("customer_access"\)/);
  assert.match(auth, /\.eq\("user_id", auth\.user\.id\)/);
  assert.match(auth, /canUseClientFeatures\(customerStatus\)/);
  assert.doesNotMatch(auth, /unstable_cache|force-cache/);
});

test("intake loads student-specific records concurrently with prospect resolution", () => {
  assert.match(intake, /loadProspectIntakeData\(studentId: string\)/);
  assert.match(intake, /\.eq\("student_id", studentId\)/);
  assert.match(intake, /Promise\.all\(/);
  assert.match(intake, /summarizeProspectIntakeData\(/);
  assert.match(intake, /requiredStarterDocumentCategoriesForBacStatus\(bacStatus\)/);
  assert.match(hub, /const intakeDataPromise = loadProspectIntakeData\(userId\)/);
  assert.match(hub, /summarizeProspectIntakeData\(\s*await intakeDataPromise,\s*answers\?\.bacStatus/);
  assert.doesNotMatch(hub, /unstable_cache|cache: "force-cache"/);
});

test("off-site backup fails closed and includes actual Storage bytes", () => {
  assert.match(backup, /set -euo pipefail/);
  assert.match(backup, /umask 077/);
  assert.match(backup, /PGPASSFILE RESTIC_REPOSITORY RESTIC_PASSWORD_FILE ALMAGO_STORAGE_SOURCE/);
  assert.match(backup, /pg_dump --format=custom --no-owner --no-acl/);
  assert.match(backup, /rclone copy "\$ALMAGO_STORAGE_SOURCE"/);
  assert.match(backup, /restic backup --quiet --tag almago --tag supabase/);
  assert.match(backup, /restic snapshots --latest 1 --json/);
  assert.match(backup, /trap cleanup EXIT/);
  assert.match(backup, /mountpoint -q/);
  assert.match(backup, /ALMAGO_BACKUP_TMP_DIR/);
  assert.match(runbook, /LUKS-encrypted volume/);
  assert.doesNotMatch(backup, /rclone sync|pg_restore|restic forget|RESTIC_PASSWORD=/);
  assert.match(runbook, /Status: \*\*implementation prepared in GitHub only\*\*/);
  assert.match(runbook, /NOT ACTIVE/);
  assert.match(runbook, /restore/i);
});
