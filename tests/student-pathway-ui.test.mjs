import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/pathway/page.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");

test("student pathway wires real project, evidence and language-course facts into the regulatory engine", () => {
  assert.match(page, /from\("student_projects"\)/);
  assert.match(page, /from\("academic_evidence"\)/);
  assert.match(page, /from\("language_courses"\)/);
  assert.match(page, /from\("finance_insurance_catalog"\)/);
  assert.match(page, /from\("student_checklist_items"\)/);
  assert.match(page, /summarizeAcademicEvidence\(evidence, now\)/);
  assert.match(page, /isPublishableLanguageCourse\(course, now\)/);
  assert.match(page, /determineRegulatoryPath\(facts\)/);
});

test("student pathway exposes all canonical regulatory routes without claiming an official decision", () => {
  for (const route of ["STUDIUM", "STUDIENVORBEREITUNG", "STUDIENPLATZSUCHE", "SPRACHKURS"]) {
    assert.match(page, new RegExp(route));
  }
  assert.match(page, /ne constitue ni une décision d’admission ni une décision de visa ou de titre de séjour/);
  assert.match(page, /décision relative à un visa ou à un titre de séjour restent du ressort/);
  assert.doesNotMatch(page, /visa garanti|éligible au visa|probabilit[ée] d['’]admission|chance d['’]admission/i);
});

test("pathway fails closed when a required data source cannot be loaded", () => {
  assert.match(page, /projectResult\.error/);
  assert.match(page, /documentsResult\.error/);
  assert.match(page, /evidenceResult\.error/);
  assert.match(page, /coursesResult\.error/);
  assert.match(page, /financeResult\.error/);
  assert.match(page, /checklistResult\.error/);
  assert.match(page, /AlmaGo ne propose aucun parcours par défaut/);
});

test("next actions remain bounded to existing student surfaces", () => {
  for (const href of [
    "/student/project",
    "/student/documents",
    "/student/language-courses",
    "/student/orientation",
    "/student/checklist",
    "/student/finance-insurance",
  ]) {
    assert.match(page, new RegExp(href.replaceAll("/", "\\/")));
  }
});

test("the real student shell and dashboard expose the pathway page", () => {
  assert.match(shell, /Mon parcours/);
  assert.match(shell, /\/student\/pathway/);
  assert.match(shell, /Financement & assurance/);
  assert.match(shell, /\/student\/finance-insurance/);
  assert.match(dashboard, /Voir mon parcours/);
  assert.match(dashboard, /\/student\/pathway/);
});
