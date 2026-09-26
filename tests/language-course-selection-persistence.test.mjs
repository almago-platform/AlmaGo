import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0025_student_language_course_selection.sql", "utf8");

test("selection persistence owns rows by student and keeps admin visibility", () => {
  assert.match(migration, /student_id = auth\.uid\(\) or public\.is_admin\(\)/);
  assert.match(migration, /for insert to authenticated[\s\S]*student_id = auth\.uid\(\)/);
  assert.match(migration, /for delete to authenticated[\s\S]*student_id = auth\.uid\(\) or public\.is_admin\(\)/);
});

test("selection never auto-converts course purpose", () => {
  assert.doesNotMatch(migration, /update public\.language_courses.*purpose/is);
  assert.doesNotMatch(migration, /study_preparation.*standalone_language.*update/is);
});

test("selection trigger is fail-closed for stale inactive or malformed-source courses", () => {
  assert.match(migration, /course_record\.is_active/);
  assert.match(migration, /course_record\.verified_at is not null/);
  assert.match(migration, /course_record\.verified_at <= now\(\)/);
  assert.match(migration, /course_record\.verified_at > now\(\) - interval '30 days'/);
  assert.match(migration, /language_course_not_publishable/);
});
