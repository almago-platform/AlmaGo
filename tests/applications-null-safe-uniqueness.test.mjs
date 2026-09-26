import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0027_applications_null_safe_uniqueness.sql", "utf8");

test("applications uniqueness is NULL-safe", () => {
  assert.match(migration, /unique nulls not distinct \(student_id, program_id, intake\)/i);
});

test("migration refuses to hide pre-existing duplicates", () => {
  assert.match(migration, /group by student_id, program_id, intake/);
  assert.match(migration, /having count\(\*\) > 1/);
  assert.match(migration, /raise exception 'applications_duplicate_student_program_intake'/);
});

test("existing constraint name is preserved for compatibility", () => {
  const matches = migration.match(/applications_student_id_program_id_intake_key/g) || [];
  assert.ok(matches.length >= 2);
});
