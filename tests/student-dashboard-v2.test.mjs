import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/page.tsx", "utf8");
const journey = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");

test("student dashboard keeps the existing Supabase data contract", () => {
  assert.match(page, /from\("student_checklist_items"\)/);
  assert.match(page, /from\("documents"\)/);
  assert.match(page, /from\("program_recommendations"\)/);
  assert.match(page, /from\("applications"\)/);
  assert.match(page, /if \(!profile\?\.onboarding_completed\) redirect\("\/student\/onboarding"\)/);
});

test("student dashboard preserves next-action priority logic", () => {
  assert.match(page, /documentsNeedingAction[\s\S]*Corriger mes documents/);
  assert.match(page, /actionableApplication\?\.next_action[\s\S]*Voir ma candidature/);
  assert.match(page, /nextItem[\s\S]*Continuer mes démarches/);
});

test("student dashboard V2 centers the first view on what matters now", () => {
  assert.match(page, /Voici ce qui compte maintenant/);
  assert.match(page, /Prochaine action/);
  assert.match(page, /Préparation du dossier/);
  assert.match(page, /Votre dossier/);
  assert.match(page, /sm:grid-cols-2 xl:grid-cols-4/);
});

test("journey overview uses visual cards and remains responsive", () => {
  assert.match(journey, /rounded-\[1rem\]/);
  assert.match(journey, /sm:grid-cols-2 xl:grid-cols-3/);
  assert.match(journey, /Ouvrir →/);
  assert.match(journey, /Étape en cours/);
});

test("dashboard retains legal framing around progress and decisions", () => {
  assert.match(page, /ne représente ni une admission ni une validation finale/);
  assert.match(page, /sans remplacer les décisions des universités ou des autorités/);
});
