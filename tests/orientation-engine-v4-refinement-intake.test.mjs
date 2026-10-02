import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evaluateOrientationDeadline } from "../src/lib/orientation-engine/deadline.ts";
import { buildOrientationRefinementState } from "../src/lib/orientation-engine/refinement.ts";

function profile(overrides = {}) {
  return {
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Sciences techniques",
    generalAverage: "15.49",
    averageType: "official",
    lastDiploma: "Baccalauréat",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    engineeringSpecialty: "",
    germanLevel: "A2",
    englishLevel: "B2",
    studyLanguage: "Anglais",
    targetIntakeSeason: "",
    targetIntakeYear: "",
    budgetRange: "À définir",
    preferredCities: [],
    ...overrides,
  };
}

function evaluation({
  id,
  city = "Berlin",
  teachingLanguage = "English",
  intakeTerms = ["Winter"],
  winterDeadline = "2027-07-15",
  summerDeadline = null,
  degreeMatch = true,
}) {
  return {
    programme: {
      id,
      teachingLanguage,
      intakeTerms,
      winterDeadline,
      summerDeadline,
      university: { city },
    },
    rules: [
      {
        code: "degree_match",
        status: degreeMatch ? "eligible" : "not_eligible",
      },
    ],
  };
}

test("deadline engine asks for intake instead of inventing a deadline", () => {
  const result = evaluateOrientationDeadline({
    targetIntakeSeason: "",
    targetIntakeYear: "",
    intakeTerms: ["Winter"],
    winterDeadline: "2027-07-15",
    summerDeadline: null,
    sourceUrl: "https://example.edu/program",
    verifiedAt: "2026-09-26T00:00:00Z",
  }, new Date("2026-10-02T12:00:00Z"));

  assert.equal(result.intakeStatus, "missing_target");
  assert.equal(result.deadlineStatus, "missing_target");
  assert.equal(result.deadline, null);
});

test("deadline engine resolves a verified future winter deadline only for the matching target cycle", () => {
  const result = evaluateOrientationDeadline({
    targetIntakeSeason: "winter",
    targetIntakeYear: "2027",
    intakeTerms: ["Winter"],
    winterDeadline: "2027-07-15",
    summerDeadline: null,
    sourceUrl: "https://example.edu/program",
    verifiedAt: "2026-09-26T00:00:00Z",
  }, new Date("2026-10-02T12:00:00Z"));

  assert.equal(result.intakeStatus, "match");
  assert.equal(result.deadlineStatus, "open");
  assert.equal(result.deadline, "2027-07-15");
  assert.equal(result.cycleYear, 2027);
});

test("deadline engine aligns late-year summer deadlines to the following summer cycle", () => {
  const result = evaluateOrientationDeadline({
    targetIntakeSeason: "summer",
    targetIntakeYear: "2027",
    intakeTerms: ["Summer", "Winter"],
    winterDeadline: "2027-05-31",
    summerDeadline: "2026-11-30",
    sourceUrl: "https://example.edu/program",
    verifiedAt: "2026-09-26T00:00:00Z",
  }, new Date("2026-10-02T12:00:00Z"));

  assert.equal(result.intakeStatus, "match");
  assert.equal(result.deadlineStatus, "open");
  assert.equal(result.deadline, "2026-11-30");
  assert.equal(result.cycleYear, 2027);
});

test("deadline engine marks a stored date for another target year as to_verify", () => {
  const result = evaluateOrientationDeadline({
    targetIntakeSeason: "winter",
    targetIntakeYear: "2028",
    intakeTerms: ["Winter"],
    winterDeadline: "2027-07-15",
    summerDeadline: null,
    sourceUrl: "https://example.edu/program",
    verifiedAt: "2026-09-26T00:00:00Z",
  }, new Date("2026-10-02T12:00:00Z"));

  assert.equal(result.deadlineStatus, "to_verify");
  assert.equal(result.deadline, "2027-07-15");
  assert.equal(result.cycleYear, 2027);
});

test("deadline engine can deterministically close a verified matching cycle", () => {
  const result = evaluateOrientationDeadline({
    targetIntakeSeason: "winter",
    targetIntakeYear: "2026",
    intakeTerms: ["Winter"],
    winterDeadline: "2026-09-30",
    summerDeadline: null,
    sourceUrl: "https://example.edu/program",
    verifiedAt: "2026-09-20T00:00:00Z",
  }, new Date("2026-10-02T12:00:00Z"));

  assert.equal(result.deadlineStatus, "closed");
});

test("refinement prioritizes the prior degree for Master projects", () => {
  const result = buildOrientationRefinementState(
    profile({
      targetDegree: "Master",
      lastDiploma: "",
    }),
    [evaluation({ id: "p1" })],
  );

  assert.equal(result.nextQuestion?.field, "previous_diploma");
  assert.equal(result.nextQuestion?.reason, "master_prior_degree_needed");
});

test("refinement asks only for target intake when it is the most useful missing fact", () => {
  const result = buildOrientationRefinementState(
    profile(),
    [evaluation({ id: "p1" }), evaluation({ id: "p2", city: "Munich" })],
  );

  assert.equal(result.nextQuestion?.field, "target_intake");
  assert.equal(result.nextQuestion?.reason, "deadline_evaluation_needs_intake");
  assert.deepEqual(result.nextQuestion?.choices, ["winter", "summer"]);
  assert.equal(result.nextQuestion?.affectedRecommendationIds.length, 2);
});

test("refinement moves to study language, then city, after intake is known", () => {
  const evaluations = [
    evaluation({ id: "p1", city: "Berlin" }),
    evaluation({ id: "p2", city: "Munich" }),
  ];

  const language = buildOrientationRefinementState(
    profile({
      targetIntakeSeason: "winter",
      targetIntakeYear: "2027",
      studyLanguage: "À définir",
    }),
    evaluations,
  );
  assert.equal(language.nextQuestion?.field, "study_language");

  const city = buildOrientationRefinementState(
    profile({
      targetIntakeSeason: "winter",
      targetIntakeYear: "2027",
      studyLanguage: "Anglais",
    }),
    evaluations,
  );
  assert.equal(city.nextQuestion?.field, "preferred_city");
  assert.deepEqual(city.nextQuestion?.choices.sort(), ["Berlin", "Munich"]);
});

test("budget is not asked when no verified cost compatibility exists", () => {
  const result = buildOrientationRefinementState(
    profile({
      targetIntakeSeason: "winter",
      targetIntakeYear: "2027",
      preferredCities: ["Berlin"],
      budgetRange: "À définir",
    }),
    [evaluation({ id: "p1", city: "Berlin" })],
  );

  assert.equal(result.nextQuestion, null);
  assert.equal(result.missing.some((item) => item.field === "budget"), false);
});

test("V4 refinement stays connected to the same deterministic engine and preserves print isolation", () => {
  const publicAnswers = readFileSync("src/lib/orientation/public.ts", "utf8");
  const validation = readFileSync("src/lib/orientation/validate.ts", "utf8");
  const catalog = readFileSync("src/lib/orientation-engine/catalog.ts", "utf8");
  const rules = readFileSync("src/lib/orientation-engine/rules.ts", "utf8");
  const service = readFileSync("src/lib/orientation-engine/service.ts", "utf8");
  const card = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
  const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
  const printReport = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");

  assert.match(publicAnswers, /targetIntakeSeason/);
  assert.match(publicAnswers, /targetIntakeYear/);
  assert.match(validation, /hasIntakeSeason !== hasIntakeYear/);
  assert.match(catalog, /"intake_terms"/);
  assert.match(rules, /evaluateOrientationDeadline/);
  assert.match(rules, /deadline_to_verify/);
  assert.match(service, /buildOrientationRefinementState/);
  assert.match(card, /OrientationRefinementQuestionCard/);
  assert.match(form, /onRefineAnswers/);
  assert.match(card, /orientation-print-hide/);
  assert.match(card, /mt-1 text-sm text-\[var\(--foreground\)\]/);
  assert.match(card, /mt-4 text-xs leading-5 text-\[var\(--foreground\)\]/);
  assert.doesNotMatch(printReport, /OrientationRefinementQuestionCard/);
});
