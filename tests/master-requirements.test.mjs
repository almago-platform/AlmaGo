import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveApplicationRoute,
  resolveMasterRequirementProfile,
  resolvePositiveNumber,
  resolveVerifiedValue,
} from "../src/lib/master-requirements.ts";

const now = new Date("2026-09-25T12:00:00Z");
const evidence = {
  source_url: "https://example.edu/master",
  verified_at: "2026-09-24T10:00:00Z",
  review_due_at: "2026-12-24T10:00:00Z",
};

test("verified positive ECTS are usable", () => {
  const result = resolvePositiveNumber({ value: 180, ...evidence }, now);
  assert.deepEqual(result, { status: "verified", value: 180, reason: "Valeur vérifiée." });
});

test("missing or invalid ECTS never become zero", () => {
  assert.equal(resolvePositiveNumber(undefined, now).value, null);
  assert.equal(resolvePositiveNumber({ value: 0, ...evidence }, now).status, "needs_manual_review");
  assert.equal(resolvePositiveNumber({ value: -10, ...evidence }, now).value, null);
});

test("an absent minimum grade stays unknown", () => {
  const result = resolveVerifiedValue(undefined, now);
  assert.equal(result.status, "unknown");
  assert.equal(result.value, null);
});

test("free-text academic requirements require manual review", () => {
  const result = resolveVerifiedValue({
    value: null,
    free_text: "Related Bachelor degree required",
    ...evidence,
  }, now);
  assert.equal(result.status, "needs_manual_review");
  assert.equal(result.value, null);
});

test("explicit verified uni-assist and VPD routes are preserved", () => {
  assert.equal(resolveApplicationRoute({ value: "uni_assist", ...evidence }, now).value, "uni_assist");
  assert.equal(resolveApplicationRoute({ value: "vpd", ...evidence }, now).value, "vpd");
});

test("unknown routes stay unknown and are never inferred", () => {
  const result = resolveApplicationRoute({ value: "unknown", ...evidence }, now);
  assert.equal(result.status, "unknown");
  assert.equal(result.value, "unknown");
});

test("invalid sources and stale, missing or future verification are not confirmed", () => {
  assert.equal(resolveVerifiedValue({ value: 120, ...evidence, source_url: "http://example.edu" }, now).status, "needs_reverification");
  assert.equal(resolveVerifiedValue({ value: 120, source_url: evidence.source_url }, now).status, "needs_reverification");
  assert.equal(resolveVerifiedValue({ value: 120, ...evidence, review_due_at: "2026-09-25T11:59:59Z" }, now).status, "needs_reverification");
  assert.equal(resolveVerifiedValue({ value: 120, ...evidence, verified_at: "2026-09-26T10:00:00Z" }, now).status, "needs_reverification");
});

test("the complete profile exposes only resolved requirement states", () => {
  const profile = resolveMasterRequirementProfile({
    minimum_ects: { value: 180, ...evidence },
    minimum_grade: undefined,
    prior_degree: { value: null, free_text: "Related Bachelor", ...evidence },
    application_route: { value: "direct", ...evidence },
    subject_credits: [{ subject: "Mathematics", value: 20, ...evidence }],
    languages: [{ language: "English", value: "C1", ...evidence }],
  }, now);

  assert.equal(profile.minimum_ects.value, 180);
  assert.equal(profile.minimum_grade.status, "unknown");
  assert.equal(profile.prior_degree.status, "needs_manual_review");
  assert.equal(profile.application_route.value, "direct");
  assert.equal(profile.subject_credits[0].requirement.value, 20);
  assert.equal(profile.languages[0].requirement.value, "C1");
});
