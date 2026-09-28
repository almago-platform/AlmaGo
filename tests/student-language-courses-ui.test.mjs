import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/language-courses/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentLanguageCoursesPanel.tsx", "utf8");
const copy = readFileSync("src/content/student-language-courses-copy.ts", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const nav = readFileSync("src/components/student/StudentNav.tsx", "utf8");
const appShell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("Student navigation exposes the verified language-course surface", () => {
  assert.match(nav, /Cours de langue/);
  assert.match(nav, /\/student\/language-courses/);
  assert.ok(nativeCopy.includes('"Cours de langue"'));
  assert.match(appShell, /\/student\/language-courses/);
  assert.ok(nativeCopy.includes('"Mon projet"'));
  assert.match(appShell, /\/student\/project/);
  assert.ok(copy.includes('title: "Cours de langue vérifiés"'));
  assert.match(page, /studentLanguageCoursesCopy/);
});

test("language-course UI keeps the two purposes visibly distinct in every locale contract", () => {
  assert.match(panel, /study_preparation/);
  assert.match(panel, /standalone_language/);
  assert.ok(copy.includes('study_preparation: "Préparation aux études"'));
  assert.ok(copy.includes('standalone_language: "Cours de langue autonome"'));
  assert.ok(copy.includes('study_preparation: "Studienvorbereitung"'));
  assert.ok(copy.includes('standalone_language: "Eigenständiger Sprachkurs"'));
  assert.match(panel, /t\.catalogueDescription/);
});

test("filters stay inside the existing factual API contract", () => {
  for (const filter of ["purpose", "city", "language", "level_from", "level_to"]) {
    assert.match(panel, new RegExp(filter), filter);
  }
  assert.match(panel, /\/api\/student\/language-courses/);
  assert.doesNotMatch(panel, /eligibility|visa_type|score|ranking/i);
});

test("unknown optional course facts remain explicit instead of invented", () => {
  assert.match(panel, /t\.unknown/);
  assert.ok(copy.includes('unknown: "À confirmer"'));
  assert.match(panel, /course\.hours_per_week === null/);
  assert.match(panel, /course\.price_cents === null/);
  assert.match(panel, /course\.level_from/);
  assert.match(panel, /course\.level_to/);
});

test("Student copy does not claim recommendation, admission or visa eligibility", () => {
  assert.doesNotMatch(
    panel,
    /recommended for you|recommand[ée] pour vous|éligible au visa|visa garanti|probabilit[ée] d['’]admission|chance d['’]admission/i,
  );
  assert.ok(copy.includes("ne constitue ni une décision d’admission ni une décision de visa"));
  assert.ok(copy.includes("It is not an admission or visa decision"));
});

test("loading, error and empty catalogue states remain explicit", () => {
  assert.match(panel, /t\.loading/);
  assert.match(panel, /t\.unavailableTitle/);
  assert.match(panel, /t\.emptyTitle/);
  assert.match(panel, /role="alert"/);
  assert.match(panel, /aria-live="polite"/);
});
