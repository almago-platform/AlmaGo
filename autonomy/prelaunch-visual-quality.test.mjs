import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPrelaunchVisualPlan,
  visualQualityDecision,
  VISUAL_WRITABLE_PATHS,
} from "./prelaunch-visual-quality-core.mjs";

const reviseHigh = {
  verdict: "REVISE",
  confidence: "high",
  findings: [
    { severity: "moderate", area: "hierarchy", summary: "The primary CTA does not dominate the first screen." },
    { severity: "low", area: "spacing", summary: "One secondary gap is slightly inconsistent." },
  ],
  actions: [
    "Strengthen the existing primary CTA hierarchy without changing its copy.",
    "Normalize spacing while preserving the current information order.",
  ],
};

test("PASS, low confidence and low-severity-only reviews never dispatch", () => {
  assert.equal(visualQualityDecision({ verdict: "PASS", confidence: "high", findings: [], actions: [] }).reason, "visual_review_pass");
  assert.equal(visualQualityDecision({ ...reviseHigh, confidence: "medium" }).reason, "visual_review_not_high_confidence");
  assert.equal(visualQualityDecision({
    verdict: "REVISE",
    confidence: "high",
    findings: [{ severity: "low", area: "spacing", summary: "Minor spacing preference." }],
    actions: ["Tweak spacing."],
  }).reason, "visual_review_only_low_severity");
});

test("high-confidence material review builds one exact-path no-merge plan", () => {
  const result = buildPrelaunchVisualPlan({
    review: reviseHigh,
    mainSha: "0123456789abcdef0123456789abcdef01234567",
  });
  assert.equal(result.eligible, true);
  assert.equal(result.plan.maxConcurrentTasks, 1);
  assert.equal(result.plan.maxRevisionAttempts, 2);
  assert.equal(result.plan.noAutomaticMerge, true);
  assert.deepEqual(result.plan.blocks[0].writable_paths, [...VISUAL_WRITABLE_PATHS]);
  assert.equal(result.plan.blocks[0].merge_class, "AUTONOMOUS_SAFE");
  assert.match(result.plan.blocks[0].block_id, /^PRELAUNCH-VISUAL-0123456789AB$/);
  assert.match(result.plan.blocks[0].prompt, /Preserve all product facts/);
  assert.match(result.plan.blocks[0].prompt, /Never merge or deploy/);
});

test("invalid visual review fails closed", () => {
  assert.equal(buildPrelaunchVisualPlan({
    review: { verdict: "REVISE", confidence: "high", findings: [], actions: [] },
    mainSha: "abc",
  }).reason, "invalid_visual_review");
});
