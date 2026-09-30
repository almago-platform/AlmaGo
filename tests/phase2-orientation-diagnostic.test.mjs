import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPublicOrientationDiagnostic,
} from "../src/lib/orientation/diagnostic.ts";
import {
  createEmptyPublicOrientationAnswers,
} from "../src/lib/orientation/public.ts";

function baseAnswers() {
  return {
    ...createEmptyPublicOrientationAnswers(),
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Mathématiques",
    generalAverage: "14",
    lastDiploma: "Baccalauréat",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    germanLevel: "B2",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    budgetRange: "800–1 000 € / mois",
  };
}

test("future Bac profile gets a staged roadmap without an admission claim", () => {
  const result = buildPublicOrientationDiagnostic({
    ...baseAnswers(),
    bacStatus: "preparing",
    bacYear: "2027",
    germanLevel: "A1",
  });

  assert.equal(result.headlineCode, "future_bac");
  assert.equal(result.overallStatus, "known_gap");
  assert.deepEqual(
    result.paths.map((item) => item.code),
    ["future_bac_roadmap", "bachelor_program_search", "german_preparation"],
  );
  assert.ok(result.paths.length <= 3);
  assert.ok(result.ruleTrace.includes("R-BAC-PREPARING"));
});

test("Master profile without prior diploma fails open as missing information", () => {
  const result = buildPublicOrientationDiagnostic({
    ...baseAnswers(),
    targetDegree: "Master",
    lastDiploma: "",
  });

  assert.equal(result.headlineCode, "master_project");
  assert.equal(result.overallStatus, "needs_information");
  assert.ok(result.priorities.some((item) => item.code === "add_prior_diploma"));
  assert.ok(result.checks.some((item) => item.code === "master_entry_requirements"));
});

test("Master profile with only a Bac is marked as a preparation gap, not rejected", () => {
  const result = buildPublicOrientationDiagnostic({
    ...baseAnswers(),
    targetDegree: "Master",
    lastDiploma: "Baccalauréat",
  });

  assert.equal(result.overallStatus, "known_gap");
  assert.ok(result.priorities.some((item) => item.code === "complete_prior_degree"));
  assert.ok(!result.ruleTrace.some((rule) => /reject|exclude|admit/i.test(rule)));
});

test("strong English does not create an English preparation path", () => {
  const result = buildPublicOrientationDiagnostic({
    ...baseAnswers(),
    studyLanguage: "Anglais",
    englishLevel: "C1",
  });

  assert.ok(!result.paths.some((item) => item.code === "english_preparation"));
  assert.ok(result.checks.some((item) => item.code === "language_requirement"));
});

test("missing average is information to add and never a refusal", () => {
  const result = buildPublicOrientationDiagnostic({
    ...baseAnswers(),
    generalAverage: "",
  });

  assert.ok(result.priorities.some((item) => item.code === "add_average"));
  assert.equal(result.overallStatus, "needs_verification");
});

test("diagnostic is deterministic for identical inputs", () => {
  const input = baseAnswers();
  assert.deepEqual(
    buildPublicOrientationDiagnostic(input),
    buildPublicOrientationDiagnostic(input),
  );
});
