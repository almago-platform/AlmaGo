import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const helper = readFileSync("src/lib/student/arabic-display.ts", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const applications = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
const documents = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const orientation = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
const courses = readFileSync("src/components/student/StudentLanguageCoursesPanel.tsx", "utf8");
const pathway = readFileSync("src/app/student/pathway/page.tsx", "utf8");
const finance = readFileSync("src/app/student/finance-insurance/page.tsx", "utf8");
const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
const onboarding = readFileSync("src/components/student/OnboardingForm.tsx", "utf8");
const journeyHeader = readFileSync("src/components/student/StudentJourneyHeader.tsx", "utf8");
const resourceHeader = readFileSync("src/components/student/StudentResourceHeader.tsx", "utf8");
const playwright = readFileSync("playwright.config.mjs", "utf8");

test("Arabic render helpers cover stored French system content without changing persisted data", () => {
  assert.match(helper, /Préparer les prochaines étapes avant l’échéance enregistrée/);
  assert.match(helper, /localizeApplicationStoredText/);
  assert.match(helper, /localizeProgramRequirement/);
  assert.match(helper, /localizeFinanceCatalogueField/);
  assert.match(helper, /study_preparation_tunisia/);
  assert.match(helper, /localizeRegulatorySummary/);
});

test("dashboard and applications localize system actions and isolate mixed-direction records", () => {
  assert.match(dashboard, /localizeApplicationStoredText\(locale, actionableApplication\.next_action\)/);
  assert.match(applications, /localizeApplicationStoredText\(locale, application\.next_action\)/);
  assert.match(applications, /localizeApplicationStoredText\(locale, event\.message\)/);
  assert.match(applications, /<bdi dir="ltr">\{university\.city\}<\/bdi>/);
  assert.match(applications, /<p dir="auto"[^>]*>\{application\.student_notes\}<\/p>/);
});

test("documents and orientation protect filenames, institutions, German names and CEFR values", () => {
  assert.match(documents, /<bdi dir="auto">\{document\.original_filename\}<\/bdi>/);
  assert.match(documents, /<bdi dir="auto">\{item\.institution \|\| t\.unknown\}<\/bdi>/);
  assert.match(orientation, /localizeProgramRequirement\(locale, program\.diploma_required\)/);
  assert.match(orientation, /<bdi dir="ltr">\{university\.city\}<\/bdi>/);
  assert.match(orientation, /\\u2066\$\{program\.german_level_required\}\\u2069/);
});

test("language courses preserve German city names, CEFR and EUR direction", () => {
  assert.match(courses, /currencyDisplay: copy\.intlLocale === "ar-TN" \? "code" : "symbol"/);
  assert.match(courses, /dir=\{locale === "ar" \? "ltr" : undefined\}/);
  assert.match(courses, /localizeCatalogueLabel\(locale, course\.language\)/);
  assert.equal((courses.match(/const result = await response\.json\(\)\.catch\(\(\) => \(\{\}\)\);/g) || []).length, 2);
});

test("pathway and finance localize verified catalogue prose only at Arabic render time", () => {
  assert.match(pathway, /localizeRegulatorySummary\(locale, source\.topic, source\.summary\)/);
  assert.match(pathway, /currencyDisplay: locale === "ar" \? "code" : "symbol"/);
  assert.match(finance, /localizeFinanceCatalogueField\(locale, option\.provider_name, "description"/);
  assert.match(finance, /localizeFinanceCatalogueField\(locale, option\.provider_name, "eligibility"/);
});

test("onboarding and checklist avoid Arabic clipping and isolate technical values", () => {
  assert.match(onboarding, /locale === "ar" \? "mt-0\.5 text-\[0\.68rem\] leading-4/);
  assert.match(onboarding, /inputDir=\{locale === "ar" \? "ltr" : undefined\}/);
  assert.match(onboarding, /<bdi dir="ltr">\{progress\}<\/bdi>/);
  assert.match(checklist, /<bdi dir="ltr">\{checklistItems\.length \? `\$\{progression\}%` : "—"\}<\/bdi>/);
  assert.match(checklist, /dir="auto" className="mt-3 font-bold/);
});

test("shared student headers keep semantic navigation structures", () => {
  assert.match(journeyHeader, /<nav/);
  assert.match(journeyHeader, /aria-label/);
  assert.match(resourceHeader, /<nav/);
  assert.match(resourceHeader, /aria-label/);
});

test("responsive browser matrix explicitly covers release widths", () => {
  for (const width of [360, 390, 768, 1440]) {
    assert.match(playwright, new RegExp(`width: ${width}\\b`));
  }
});
