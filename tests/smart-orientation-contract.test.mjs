import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyPublicOrientationAnswers,
  normalizePublicOrientationAverageType,
  restorePublicOrientationAnswers,
} from "../src/lib/orientation/public.ts";
import {
  SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD,
  SMART_ORIENTATION_PRIORITY_ENGINE_VERSION,
  isSmartOrientationPriorityState,
  smartOrientationPriorityReasonCodes,
  smartOrientationPriorityStates,
} from "../src/lib/phase2/smart-orientation.ts";

test("SO-0 defines a closed, versioned Smart Orientation priority contract", () => {
  assert.equal(
    SMART_ORIENTATION_PRIORITY_ENGINE_VERSION,
    "smart-orientation-priority-v1",
  );
  assert.equal(SMART_ORIENTATION_HIGH_PRIORITY_AVERAGE_THRESHOLD, 12);
  assert.deepEqual(smartOrientationPriorityStates, [
    "priority_ready",
    "priority_prepare_now",
    "priority_standard",
    "priority_follow_up",
  ]);
  assert.equal(isSmartOrientationPriorityState("priority_ready"), true);
  assert.equal(isSmartOrientationPriorityState("qualified_prospect"), false);
});

test("SO-0 reason codes stay explainable and contain no rejection state", () => {
  for (const reason of [
    "bac_obtained",
    "bac_preparing",
    "average_above_12",
    "average_12_or_below",
    "average_missing",
    "target_degree_defined",
    "target_field_defined",
    "project_information_missing",
    "sensitive_field_human_review",
    "language_preparation_needed",
    "ready_for_priority_review",
    "prepare_now_before_bac",
  ]) {
    assert.ok(smartOrientationPriorityReasonCodes.includes(reason));
  }

  assert.equal(
    smartOrientationPriorityReasonCodes.some((reason) =>
      /reject|refus|inadmiss|visa_denied|admission_denied/i.test(reason),
    ),
    false,
  );
});

test("empty orientation has no average provenance", () => {
  const answers = createEmptyPublicOrientationAnswers();
  assert.equal(answers.generalAverage, "");
  assert.equal(answers.averageType, "");
});

test("legacy obtained Bac orientation infers an official average", () => {
  const answers = restorePublicOrientationAnswers({
    bacStatus: "obtained",
    generalAverage: "15",
  });
  assert.equal(answers.generalAverage, "15");
  assert.equal(answers.averageType, "official");
});

test("legacy Bac-in-preparation orientation infers a current estimate", () => {
  const answers = restorePublicOrientationAnswers({
    bacStatus: "preparing",
    generalAverage: "14",
  });
  assert.equal(answers.generalAverage, "14");
  assert.equal(answers.averageType, "current_estimate");
});

test("average provenance is empty when no average is supplied", () => {
  assert.equal(
    normalizePublicOrientationAverageType({
      bacStatus: "obtained",
      generalAverage: "",
      averageType: "official",
    }),
    "",
  );
  assert.equal(
    normalizePublicOrientationAverageType({
      bacStatus: "preparing",
      generalAverage: "",
      averageType: "current_estimate",
    }),
    "",
  );
});

test("Bac status wins over inconsistent browser-supplied average provenance", () => {
  assert.equal(
    normalizePublicOrientationAverageType({
      bacStatus: "obtained",
      generalAverage: "13",
      averageType: "current_estimate",
    }),
    "official",
  );
  assert.equal(
    normalizePublicOrientationAverageType({
      bacStatus: "preparing",
      generalAverage: "13",
      averageType: "official",
    }),
    "current_estimate",
  );
});
