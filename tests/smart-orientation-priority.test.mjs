import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyPublicOrientationAnswers,
  restorePublicOrientationAnswers,
} from "../src/lib/orientation/public.ts";
import {
  evaluateSmartOrientationPriority,
} from "../src/lib/phase2/smart-orientation.ts";

function answers(overrides = {}) {
  return restorePublicOrientationAnswers({
    ...createEmptyPublicOrientationAnswers(),
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Sciences expérimentales",
    generalAverage: "13",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    germanLevel: "B2",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    budgetRange: "À définir",
    preferredCities: [],
    ...overrides,
  });
}

test("obtained Bac above 12 is high priority", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "15",
  }));

  assert.equal(result.state, "priority_ready");
  assert.ok(result.reasonCodes.includes("bac_obtained"));
  assert.ok(result.reasonCodes.includes("average_above_12"));
  assert.ok(result.reasonCodes.includes("ready_for_priority_review"));
});

test("Bac in preparation above 12 is prepare-now priority, not too early", () => {
  const result = evaluateSmartOrientationPriority(answers({
    bacStatus: "preparing",
    generalAverage: "14",
  }));

  assert.equal(result.state, "priority_prepare_now");
  assert.ok(result.reasonCodes.includes("bac_preparing"));
  assert.ok(result.reasonCodes.includes("average_above_12"));
  assert.ok(result.reasonCodes.includes("prepare_now_before_bac"));
});

test("12 is not above the owner high-priority threshold", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "12",
  }));

  assert.equal(result.state, "priority_standard");
  assert.ok(result.reasonCodes.includes("average_12_or_below"));
  assert.equal(result.reasonCodes.includes("average_above_12"), false);
});

test("a lower average remains supportable with standard priority", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "10",
  }));

  assert.equal(result.state, "priority_standard");
  assert.ok(result.reasonCodes.includes("average_12_or_below"));
});

test("missing average never rejects an otherwise structured project", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "",
  }));

  assert.equal(result.state, "priority_standard");
  assert.ok(result.reasonCodes.includes("average_missing"));
});

test("missing structural project information becomes follow-up, not rejection", () => {
  const result = evaluateSmartOrientationPriority(answers({
    targetField: "",
  }));

  assert.equal(result.state, "priority_follow_up");
  assert.ok(result.reasonCodes.includes("project_information_missing"));
});

test("low German level adds preparation guidance without lowering high priority", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "15",
    germanLevel: "A2",
    studyLanguage: "Allemand",
  }));

  assert.equal(result.state, "priority_ready");
  assert.ok(result.reasonCodes.includes("language_preparation_needed"));
});

test("medicine and health keeps academic claims human-reviewed", () => {
  const result = evaluateSmartOrientationPriority(answers({
    generalAverage: "15",
    targetField: "Médecine/Santé",
    germanLevel: "A2",
  }));

  assert.equal(result.state, "priority_ready");
  assert.equal(result.requiresHumanReview, true);
  assert.ok(result.reasonCodes.includes("sensitive_field_human_review"));
  assert.ok(result.reasonCodes.includes("language_preparation_needed"));
});

test("non-sensitive fields do not set the sensitive-field human-review flag", () => {
  const result = evaluateSmartOrientationPriority(answers({
    targetField: "Informatique",
  }));

  assert.equal(result.requiresHumanReview, false);
});

test("priority engine emits no qualification, admission or visa decision", () => {
  for (const input of [
    answers({ generalAverage: "18" }),
    answers({ bacStatus: "preparing", generalAverage: "16" }),
    answers({ generalAverage: "8" }),
    answers({ targetDegree: "" }),
  ]) {
    const result = evaluateSmartOrientationPriority(input);
    assert.match(result.state, /^priority_/);
    assert.doesNotMatch(
      JSON.stringify(result),
      /qualified_prospect|admission|admissible|visa|reject|refus/i,
    );
  }
});
