import assert from "node:assert/strict";
import test from "node:test";
import { matchMasterRequirements } from "../src/lib/master-requirements-match.ts";

const now = new Date("2026-09-25T12:00:00Z");
const evidence = {
  source_url: "https://example.edu/master",
  verified_at: "2026-09-24T10:00:00Z",
  review_due_at: "2026-12-24T10:00:00Z",
};

const criterion = (result, name) => result.criteria.find((item) => item.criterion === name);

test("German B2 required and student C1 is satisfied", () => {
  const result = matchMasterRequirements(
    { current_german_level: "C1" },
    { languages: [{ language: "German", value: "B2", ...evidence }] },
    now,
  );
  assert.equal(criterion(result, "language:German")?.status, "satisfied");
});

test("German C1 required and student B2 is not satisfied", () => {
  const result = matchMasterRequirements(
    { current_german_level: "B2" },
    { languages: [{ language: "German", value: "C1", ...evidence }] },
    now,
  );
  assert.equal(criterion(result, "language:German")?.status, "not_satisfied");
  assert.equal(result.has_blocking_mismatch, true);
});

test("missing student language stays unknown", () => {
  const result = matchMasterRequirements(
    {},
    { languages: [{ language: "German", value: "B2", ...evidence }] },
    now,
  );
  assert.equal(criterion(result, "language:German")?.status, "unknown");
});

test("free-text prior degree requires manual review", () => {
  const result = matchMasterRequirements(
    { current_diploma: "Bachelor Computer Engineering" },
    { prior_degree: { value: null, free_text: "Related Bachelor degree", ...evidence } },
    now,
  );
  assert.equal(criterion(result, "prior_degree")?.status, "needs_manual_review");
});

test("verified ECTS and grades stay unknown when student facts do not exist", () => {
  const result = matchMasterRequirements(
    {},
    {
      minimum_ects: { value: 180, ...evidence },
      minimum_grade: { value: 2.5, ...evidence },
      subject_credits: [{ subject: "Mathematics", value: 20, ...evidence }],
    },
    now,
  );
  assert.equal(criterion(result, "minimum_ects")?.status, "unknown");
  assert.equal(criterion(result, "minimum_grade")?.status, "unknown");
  assert.equal(criterion(result, "subject_credits:Mathematics")?.status, "unknown");
  assert.equal(result.has_unknowns, true);
});

test("intake compares only structured semester families", () => {
  const satisfied = matchMasterRequirements(
    { target_intake: "Hiver 2027" },
    { intake: { value: "Wintersemester", ...evidence } },
    now,
  );
  const mismatch = matchMasterRequirements(
    { target_intake: "Sommersemester" },
    { intake: { value: "Wintersemester", ...evidence } },
    now,
  );
  assert.equal(criterion(satisfied, "intake")?.status, "satisfied");
  assert.equal(criterion(mismatch, "intake")?.status, "not_satisfied");
});

test("future deadline is available and past deadline is not satisfied", () => {
  const future = matchMasterRequirements({}, { deadline: { value: "2027-07-15", ...evidence } }, now);
  const past = matchMasterRequirements({}, { deadline: { value: "2026-07-15", ...evidence } }, now);
  assert.equal(criterion(future, "deadline")?.status, "satisfied");
  assert.equal(criterion(past, "deadline")?.status, "not_satisfied");
});

test("expired or unverified rules are never treated as satisfied", () => {
  const expired = matchMasterRequirements(
    { current_german_level: "C1" },
    { languages: [{ language: "German", value: "B2", ...evidence, review_due_at: "2026-09-24T10:00:00Z" }] },
    now,
  );
  const unverified = matchMasterRequirements(
    { target_intake: "Wintersemester" },
    { intake: { value: "Wintersemester" } },
    now,
  );
  assert.equal(criterion(expired, "language:German")?.status, "needs_manual_review");
  assert.equal(criterion(unverified, "intake")?.status, "unknown");
});

test("application route is informational and never creates an eligibility criterion", () => {
  const result = matchMasterRequirements(
    {},
    { application_route: { value: "vpd", ...evidence } },
    now,
  );
  assert.equal(result.application_route, "vpd");
  assert.equal(result.criteria.length, 0);
  assert.equal(result.has_blocking_mismatch, false);
});

test("missing information never becomes satisfied", () => {
  const result = matchMasterRequirements(
    {},
    {
      minimum_ects: { value: 180, ...evidence },
      languages: [{ language: "English", value: "C1", ...evidence }],
    },
    now,
  );
  assert.equal(result.criteria.every((item) => item.status !== "satisfied"), true);
});
