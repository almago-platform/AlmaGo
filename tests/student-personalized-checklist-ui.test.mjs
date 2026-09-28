import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/checklist/page.tsx", "utf8");
const copy = readFileSync("src/content/student-checklist-copy.ts", "utf8");

test("student checklist derives a personalized Germany plan from real dossier facts", () => {
  assert.match(page, /from\("student_projects"\)/);
  assert.match(page, /from\("academic_evidence"\)/);
  assert.match(page, /from\("student_language_course_selections"\)/);
  assert.match(page, /summarizeAcademicEvidence/);
  assert.match(page, /determineRegulatoryPath/);
  assert.match(page, /buildGermanyChecklist/);
});

test("personalized plan is visibly separated from persisted operational checklist", () => {
  assert.ok(copy.includes('planEyebrow: "Selon votre dossier"'));
  assert.ok(copy.includes('planTitle: "Étapes selon votre dossier"'));
  assert.ok(copy.includes('progressTitle: "Démarches enregistrées dans votre dossier"'));
  assert.ok(copy.includes("ne garantissent ni admission, ni date limite, ni visa"));
  assert.match(page, /t\.page\.planTitle/);
  assert.match(page, /t\.page\.progressTitle/);
});

test("course-dependent checklist facts come only from the student's explicit selection", () => {
  assert.match(page, /selectedCourse\?\.purpose === "study_preparation"/);
  assert.match(page, /selectedCourse\?\.purpose === "standalone_language"/);
  assert.doesNotMatch(page, /from\("language_courses"\)[\s\S]*\.limit\(1\)/);
});
