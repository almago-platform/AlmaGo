import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  createEmptyPublicOrientationAnswers,
  restorePublicOrientationAnswers,
} = await import("../src/lib/orientation/public.ts");
const {
  buildOrientationDiscoveryPlan,
  normalizeOrientationDiscoveryProfile,
} = await import("../src/lib/orientation-engine/discovery/contract.ts");

const form = readFileSync(
  "src/components/orientation/PublicOrientationForm.tsx",
  "utf8",
);
const profileOptions = readFileSync(
  "src/lib/student/profile-options.ts",
  "utf8",
);
const writer = readFileSync(
  "src/lib/orientation-engine/writer/core.ts",
  "utf8",
);
const gemini = readFileSync(
  "src/lib/orientation-engine/writer/gemini.ts",
  "utf8",
);
const review = readFileSync(
  "src/lib/orientation-engine/review/core.ts",
  "utf8",
);
const knowledge = readFileSync(
  "src/lib/orientation-engine/discovery/knowledge-core.ts",
  "utf8",
);

function base(overrides = {}) {
  return {
    ...createEmptyPublicOrientationAnswers(),
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Informatique",
    generalAverage: "14",
    averageType: "official",
    lastDiploma: "Bac + 2",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    germanLevel: "B1",
    englishLevel: "B2",
    studyLanguage: "Allemand et anglais",
    budgetRange: "800–1 000 € / mois",
    preferredCities: ["Berlin"],
    ...overrides,
  };
}

test("legacy orientation answers restore with empty higher-education context", () => {
  const restored = restorePublicOrientationAnswers({
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Informatique",
    targetDegree: "Bachelor",
    targetField: "Informatique",
  });

  assert.equal(restored.higherEducationStatus, "");
  assert.equal(restored.currentStudyField, "");
  assert.equal(restored.universitySemesters, "");
  assert.equal(restored.studyIntent, "");
  assert.equal(restored.targetSpecialization, "");
});

test("higher-education context is bounded and normalized for discovery", () => {
  const profile = normalizeOrientationDiscoveryProfile(base({
    higherEducationStatus: "interrupted",
    currentStudyField: "Informatique",
    universitySemesters: "4",
    studyIntent: "transfer_credits",
  }));

  assert.equal(profile.higherEducationStatus, "interrupted");
  assert.equal(profile.currentStudyField, "Informatique");
  assert.equal(profile.universitySemesters, 4);
  assert.equal(profile.studyIntent, "transfer_credits");
});

test("Master specialization gets a dedicated discovery query", () => {
  const plan = buildOrientationDiscoveryPlan(base({
    lastDiploma: "Licence",
    higherEducationStatus: "completed",
    currentStudyField: "Informatique",
    universitySemesters: "6",
    studyIntent: "master_after_degree",
    targetDegree: "Master",
    targetSpecialization: "Data / AI",
  }));

  assert.equal(plan.status, "ready");
  assert.equal(plan.profile.targetSpecialization, "Data / AI");
  assert.ok(
    plan.searchQueries.some((query) =>
      /Data \/ AI Master Germany official university programme/i.test(query)
    ),
  );
});

test("public form distinguishes current, interrupted and completed university study", () => {
  for (const token of [
    "higherEducationStatusOptions",
    "currentStudyField",
    "universitySemesters",
    "studyIntentOptions",
    "targetSpecialization",
  ]) {
    assert.match(form, new RegExp(token));
  }

  for (const token of [
    "currently_enrolled",
    "interrupted",
    "completed",
    "transfer_credits",
    "restart_bachelor",
    "switch_field",
  ]) {
    assert.match(profileOptions, new RegExp(token));
  }
});

test("writer and human review receive the same higher-education state", () => {
  for (const token of [
    "higher_education_status",
    "current_study_field",
    "university_semesters",
    "study_intent",
    "target_specialization",
  ]) {
    assert.match(writer, new RegExp(token));
  }

  for (const token of [
    "higherEducationStatus",
    "currentStudyField",
    "universitySemesters",
    "studyIntent",
    "targetSpecialization",
  ]) {
    assert.match(review, new RegExp(token));
    assert.match(knowledge, new RegExp(token));
  }

  assert.match(gemini, /never promise transfer, recognition or entry into a higher semester/i);
  assert.match(gemini, /target_specialization/i);
});
