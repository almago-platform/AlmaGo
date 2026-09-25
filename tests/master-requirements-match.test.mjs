import assert from "node:assert/strict";
import test from "node:test";
import { matchMasterRequirements } from "../src/lib/master-requirements-match.ts";

const now = new Date("2026-09-25T12:00:00Z");
const evidence = { source_url: "https://example.edu/master", verified_at: "2026-09-24T10:00:00Z", review_due_at: "2026-12-24T10:00:00Z" };
const get = (result, name) => result.criteria.find((item) => item.criterion === name);

test("German CEFR comparison returns satisfied or not_satisfied", () => {
  const ok = matchMasterRequirements({ current_german_level: "C1" }, { languages: [{ language: "German", value: "B2", ...evidence }] }, now);
  const low = matchMasterRequirements({ current_german_level: "B2" }, { languages: [{ language: "German", value: "C1", ...evidence }] }, now);
  assert.equal(get(ok, "language:German")?.status, "satisfied");
  assert.equal(get(low, "language:German")?.status, "not_satisfied");
  assert.equal(low.has_blocking_mismatch, true);
});

test("missing student language stays unknown", () => {
  const result = matchMasterRequirements({}, { languages: [{ language: "German", value: "B2", ...evidence }] }, now);
  assert.equal(get(result, "language:German")?.status, "unknown");
});

test("free-text prior degree requires manual review", () => {
  const result = matchMasterRequirements(
    { current_diploma: "Bachelor Computer Engineering" },
    { prior_degree: { value: null, free_text: "Related Bachelor degree", ...evidence } }, now,
  );
  assert.equal(get(result, "prior_degree")?.status, "needs_manual_review");
});

test("ECTS, subject credits and grade stay unknown without student facts", () => {
  const result = matchMasterRequirements({}, {
    minimum_ects: { value: 180, ...evidence },
    minimum_grade: { value: 2.5, ...evidence },
    subject_credits: [{ subject: "Mathematics", value: 20, ...evidence }],
  }, now);
  assert.equal(get(result, "minimum_ects")?.status, "unknown");
  assert.equal(get(result, "minimum_grade")?.status, "unknown");
  assert.equal(get(result, "subject_credits:Mathematics")?.status, "unknown");
});

test("intake compares only structured semester families", () => {
  const ok = matchMasterRequirements({ target_intake: "Hiver 2027" }, { intake: { value: "Wintersemester", ...evidence } }, now);
  const no = matchMasterRequirements({ target_intake: "Sommersemester" }, { intake: { value: "Wintersemester", ...evidence } }, now);
  assert.equal(get(ok, "intake")?.status, "satisfied");
  assert.equal(get(no, "intake")?.status, "not_satisfied");
});

test("deadline availability is separate and deterministic", () => {
  const future = matchMasterRequirements({}, { deadline: { value: "2027-07-15", ...evidence } }, now);
  const past = matchMasterRequirements({}, { deadline: { value: "2026-07-15", ...evidence } }, now);
  assert.equal(get(future, "deadline")?.status, "satisfied");
  assert.equal(get(past, "deadline")?.status, "not_satisfied");
});

test("expired or unverified rules are never satisfied", () => {
  const expired = matchMasterRequirements({ current_german_level: "C1" }, {
    languages: [{ language: "German", value: "B2", ...evidence, review_due_at: "2026-09-24T10:00:00Z" }],
  }, now);
  const missing = matchMasterRequirements({ target_intake: "Wintersemester" }, { intake: { value: "Wintersemester" } }, now);
  assert.equal(get(expired, "language:German")?.status, "needs_manual_review");
  assert.equal(get(missing, "intake")?.status, "unknown");
});

test("application route stays informational", () => {
  const result = matchMasterRequirements({}, { application_route: { value: "vpd", ...evidence } }, now);
  assert.equal(result.application_route, "vpd");
  assert.equal(result.criteria.length, 0);
  assert.equal(result.has_blocking_mismatch, false);
});

test("missing information never becomes satisfied", () => {
  const result = matchMasterRequirements({}, {
    minimum_ects: { value: 180, ...evidence },
    languages: [{ language: "English", value: "C1", ...evidence }],
  }, now);
  assert.equal(result.criteria.every((item) => item.status !== "satisfied"), true);
});
