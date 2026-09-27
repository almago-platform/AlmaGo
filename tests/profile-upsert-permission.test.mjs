import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const boundaryMigration = readFileSync(
  "supabase/migrations/0029_profile_notification_write_boundary.sql",
  "utf8",
);
const upsertGrantMigration = readFileSync(
  "supabase/migrations/0030_profile_upsert_identity_column_grant.sql",
  "utf8",
);

test("profile writes remain column-restricted while upsert conflict updates can touch id", () => {
  assert.match(
    boundaryMigration,
    /revoke insert, update on table public\.profiles from authenticated/i,
  );
  assert.match(
    upsertGrantMigration,
    /grant update \(id\) on table public\.profiles to authenticated/i,
  );
  assert.doesNotMatch(upsertGrantMigration, /onboarding_completed/i);
  assert.doesNotMatch(upsertGrantMigration, /created_at/i);
  assert.doesNotMatch(upsertGrantMigration, /updated_at/i);
  assert.doesNotMatch(upsertGrantMigration, /full_name/i);
});
