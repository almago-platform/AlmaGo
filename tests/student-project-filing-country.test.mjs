import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0022_student_project_filing_country.sql", "utf8");

test("filing country is a separate bounded project fact", () => {
  assert.match(migration, /add column if not exists filing_country text/i);
  assert.match(migration, /filing_country is null or filing_country ~ '\^\[A-Z\]\{2\}\$'/);
  assert.doesNotMatch(migration, /nationality/);
});
