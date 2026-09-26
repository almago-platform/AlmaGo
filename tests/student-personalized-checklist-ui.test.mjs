import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/checklist/page.tsx", "utf8");

test("student checklist derives a personalized Germany plan from real dossier facts", () => {
  assert.match(page, /from\("student_projects"\)/);
  assert.match(page, /from\("academic_evidence"\)/);
  assert.match(page, /from\("student_language_course_selections"\)/);
  assert.match(page, /summarizeAcademicEvidence/);
  assert.match(page, /determineRegulatoryPath/);
  assert.match(page, /buildGermanyChecklist/);
});

test("personalized plan is visibly separated from persisted operational checklist", () => {
  assert.match(page, /Plan Allemagne personnalisé/);
  assert.match(page, /Étapes calculées à partir de votre dossier/);
  assert.match(page, /Démarches enregistrées dans votre dossier/);
  assert.match(page, /n’inventent ni admission, ni délai, ni éligibilité de visa/);
});

test("course-dependent checklist facts come only from the student's explicit selection", () => {
  assert.match(page, /selectedCourse\?\.purpose === "study_preparation"/);
  assert.match(page, /selectedCourse\?\.purpose === "standalone_language"/);
  assert.doesNotMatch(page, /from\("language_courses"\)[\s\S]*\.limit\(1\)/);
});
