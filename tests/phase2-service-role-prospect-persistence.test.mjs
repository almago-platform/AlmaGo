import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0044_phase2_service_role_prospect_persistence.sql",
  "utf8",
);

test("P2.4 grants only the privileged backend the required prospect persistence rights", () => {
  assert.match(
    migration,
    /grant select, insert, update, delete\s+on table public\.prospects\s+to service_role;/i,
  );
  assert.match(
    migration,
    /grant select, insert, update, delete\s+on table public\.orientations\s+to service_role;/i,
  );

  assert.doesNotMatch(migration, /grant[\s\S]*\b(?:anon|authenticated)\b/i);
  assert.doesNotMatch(migration, /grant\s+all/i);
  assert.doesNotMatch(migration, /truncate/i);
});
