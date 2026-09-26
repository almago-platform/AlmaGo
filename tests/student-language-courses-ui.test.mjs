import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/language-courses/page.tsx", "utf8");
const panel = readFileSync("src/components/student/StudentLanguageCoursesPanel.tsx", "utf8");
const nav = readFileSync("src/components/student/StudentNav.tsx", "utf8");
const appShell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("Student navigation exposes the verified language-course surface", () => {
  assert.match(nav, /Cours de langue/);
  assert.match(nav, /\/student\/language-courses/);
  assert.match(appShell, /Cours de langue/);
  assert.match(appShell, /\/student\/language-courses/);
  assert.match(appShell, /Mon projet/);
  assert.match(appShell, /\/student\/project/);
  assert.match(page, /Cours de langue vérifiés/);
});

test("language-course UI keeps the two purposes visibly distinct", () => {
  assert.match(panel, /study_preparation/);
  assert.match(panel, /Préparation aux études/);
  assert.match(panel, /standalone_language/);
  assert.match(panel, /Cours de langue autonome/);
  assert.match(panel, /Un cours intensif n’est pas automatiquement une préparation universitaire/);
});

test("filters stay inside the existing factual API contract", () => {
  for (const filter of ["purpose", "city", "language", "level_from", "level_to"]) {
    assert.match(panel, new RegExp(filter), filter);
  }
  assert.match(panel, /\/api\/student\/language-courses/);
  assert.doesNotMatch(panel, /eligibility|visa_type|score|ranking/i);
});

test("unknown optional course facts remain explicit instead of invented", () => {
  assert.match(panel, /À confirmer/);
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
  assert.match(panel, /ne constitue ni une décision d’admission ni une décision de visa/);
});

test("loading, error and empty catalogue states remain explicit", () => {
  assert.match(panel, /Chargement des cours vérifiés/);
  assert.match(panel, /Catalogue temporairement indisponible/);
  assert.match(panel, /Aucun cours ne correspond à ces filtres/);
  assert.match(panel, /role="alert"/);
  assert.match(panel, /aria-live="polite"/);
});
