import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseStudentProject, projectPaths } from "../src/lib/student/project.ts";

const migration = readFileSync("supabase/migrations/0013_germany_regulatory_project_foundation.sql", "utf8");

test("the four project paths are stable and accepted", () => {
  assert.deepEqual(projectPaths, ["university_search", "german_preparation_and_studies", "master_and_language", "language_only"]);
  for (const path of projectPaths) assert.equal(parseStudentProject({ path }).data?.path, path);
});

test("project input rejects an unknown path and bounds student-controlled values", () => {
  assert.equal(parseStudentProject({ path: "visa_only" }).error, "Choisissez un parcours valide.");
  const result = parseStudentProject({
    path: "university_search",
    preferred_cities: [" Berlin ", "Berlin", 42, "Munich"],
    notes: "x".repeat(2100),
  });
  assert.deepEqual(result.data?.preferred_cities, ["Berlin", "Munich"]);
  assert.equal(result.data?.notes?.length, 2000);
});

test("regulatory truth requires official HTTPS sources and dated checks", () => {
  assert.match(migration, /source_url text not null check \(source_url ~ '\^https:\/\/'\)/);
  assert.match(migration, /checked_on date not null/);
  assert.match(migration, /requirements jsonb[\s\S]+jsonb_typeof\(requirements\) = 'array'/);
  assert.match(migration, /Auswärtiges Amt/);
  assert.match(migration, /Ambassade d’Allemagne à Tunis/);
  assert.match(migration, /uni-assist e\.V\./);
});

test("regulatory and project tables preserve admin/student isolation with RLS", () => {
  for (const table of ["regulatory_sources", "student_projects"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }
  assert.match(migration, /student projects own or admin read/);
  assert.match(migration, /student projects own insert[\s\S]+student_id = auth\.uid\(\)/);
  assert.match(migration, /student projects own update[\s\S]+student_id = auth\.uid\(\)/);
  assert.match(migration, /regulatory sources admin write[\s\S]+public\.is_admin\(\)/);
});
