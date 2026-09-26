import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parseLanguageCourseSelectionInput } from "../src/lib/language-course-selection.ts";

const migration = readFileSync("supabase/migrations/0025_student_language_course_selection.sql", "utf8");
const api = readFileSync("src/app/api/student/language-course-selection/route.ts", "utf8");
const panel = readFileSync("src/components/student/StudentLanguageCoursesPanel.tsx", "utf8");
const pathway = readFileSync("src/app/student/pathway/page.tsx", "utf8");

test("selection input is exactly one bounded UUID", () => {
  assert.equal(parseLanguageCourseSelectionInput({ language_course_id: "00000000-0000-4000-8000-000000000001" }).ok, true);
  assert.equal(parseLanguageCourseSelectionInput({ language_course_id: "x" }).ok, false);
  assert.equal(parseLanguageCourseSelectionInput({ language_course_id: "00000000-0000-4000-8000-000000000001", extra: true }).ok, false);
});

test("database keeps one selection per student and locks the chosen course while validating publication", () => {
  assert.match(migration, /student_id uuid not null unique/);
  assert.match(migration, /for share/);
  assert.match(migration, /verified_at > now\(\) - interval '30 days'/);
  assert.match(migration, /source_url ~\*/);
  assert.match(migration, /student_id = auth\.uid\(\)/);
});

test("student API supports read upsert and clear without recommendation language", () => {
  assert.match(api, /export async function GET/);
  assert.match(api, /export async function PUT/);
  assert.match(api, /export async function DELETE/);
  assert.match(api, /isPublishableLanguageCourse/);
  assert.match(api, /role\?\.role !== "student"/);
  assert.doesNotMatch(api, /recommended|suitable|visa eligible|guaranteed/i);
});

test("student UI makes selection explicit and reversible", () => {
  assert.match(panel, /Choisir pour mon projet/);
  assert.match(panel, /Cours sélectionné/);
  assert.match(panel, /Retirer mon choix/);
  assert.match(panel, /ne constitue ni une décision d’admission/);
});

test("regulatory pathway uses the selected course rather than any catalogue item", () => {
  assert.match(pathway, /student_language_course_selections/);
  assert.match(pathway, /selectedLanguageCourseId/);
  assert.match(pathway, /selectedLanguageCourse\.purpose === "study_preparation"/);
  assert.doesNotMatch(pathway, /\(coursesResult\.data \|\| \[\]\)\.some/);
});
