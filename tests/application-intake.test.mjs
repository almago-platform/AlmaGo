import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applicationIntakeFamily,
  resolveApplicationIntake,
} from "../src/lib/application-intake.ts";

const now = new Date("2026-09-25T12:00:00Z");

test("intake families recognize German, French and semester abbreviations", () => {
  assert.equal(applicationIntakeFamily("Wintersemester"), "winter");
  assert.equal(applicationIntakeFamily("Hiver 2027"), "winter");
  assert.equal(applicationIntakeFamily("WS"), "winter");
  assert.equal(applicationIntakeFamily("Sommersemester"), "summer");
  assert.equal(applicationIntakeFamily("Été 2027"), "summer");
  assert.equal(applicationIntakeFamily("SS"), "summer");
  assert.equal(applicationIntakeFamily("rolling"), null);
});

test("student target intake selects the matching program intake and deadline", () => {
  const winter = resolveApplicationIntake({
    target_intake: "Hiver 2027",
    intake_terms: ["Wintersemester", "Sommersemester"],
    winter_deadline: "2027-07-15",
    summer_deadline: "2027-01-15",
  }, now);
  const summer = resolveApplicationIntake({
    target_intake: "Sommersemester",
    intake_terms: ["Wintersemester", "Sommersemester"],
    winter_deadline: "2027-07-15",
    summer_deadline: "2027-01-15",
  }, now);

  assert.deepEqual(
    [winter.status, winter.intake, winter.deadline],
    ["resolved", "Wintersemester", "2027-07-15"],
  );
  assert.deepEqual(
    [summer.status, summer.intake, summer.deadline],
    ["resolved", "Sommersemester", "2027-01-15"],
  );
});

test("a single structured intake can be selected without inventing another intake", () => {
  const result = resolveApplicationIntake({
    target_intake: null,
    intake_terms: ["Wintersemester"],
    winter_deadline: null,
    summer_deadline: "2027-01-15",
  }, now);

  assert.equal(result.status, "resolved");
  assert.equal(result.intake, "Wintersemester");
  assert.equal(result.deadline, null);
});

test("ambiguous or incompatible intakes fail closed", () => {
  const ambiguous = resolveApplicationIntake({
    target_intake: null,
    intake_terms: ["Wintersemester", "Sommersemester"],
  }, now);
  const incompatible = resolveApplicationIntake({
    target_intake: "Sommersemester",
    intake_terms: ["Wintersemester"],
  }, now);
  const unstructured = resolveApplicationIntake({
    target_intake: "Wintersemester",
    intake_terms: ["rolling"],
  }, now);

  assert.equal(ambiguous.status, "needs_manual_review");
  assert.equal(incompatible.status, "needs_manual_review");
  assert.equal(unstructured.status, "needs_manual_review");
});

test("invalid or past deadlines are never silently persisted", () => {
  const invalid = resolveApplicationIntake({
    target_intake: "Wintersemester",
    intake_terms: ["Wintersemester"],
    winter_deadline: "2027-02-30",
  }, now);
  const past = resolveApplicationIntake({
    target_intake: "Wintersemester",
    intake_terms: ["Wintersemester"],
    winter_deadline: "2026-09-24",
  }, now);
  const today = resolveApplicationIntake({
    target_intake: "Wintersemester",
    intake_terms: ["Wintersemester"],
    winter_deadline: "2026-09-25",
  }, now);

  assert.equal(invalid.status, "needs_manual_review");
  assert.equal(past.status, "deadline_passed");
  assert.equal(today.status, "resolved");
});

test("Student application route uses project target intake and never applies winter-first fallback", () => {
  const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");
  assert.match(route, /from\("student_projects"\)/);
  assert.match(route, /select\("target_intake"\)/);
  assert.match(route, /resolveApplicationIntake/);
  assert.match(route, /application_deadline_passed/);
  assert.doesNotMatch(route, /winter_deadline\s*\|\|\s*program\?\.summer_deadline/);
  assert.doesNotMatch(route, /intake_terms\) \? program\.intake_terms\[0\]/);
});

test("deadline failure never becomes an automatic rejection", () => {
  const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");
  assert.doesNotMatch(route, /status:\s*"rejection"/);
  assert.match(route, /status:\s*"interested"/);
});
