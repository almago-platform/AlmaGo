import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { applicationIntakeFamily, resolveApplicationIntake } from "../src/lib/application-intake.ts";

const now = new Date("2026-09-25T12:00:00Z");
const resolve = (extra = {}) => resolveApplicationIntake({
  target_intake: "Wintersemester", intake_terms: ["Wintersemester"],
  winter_deadline: "2027-07-15", summer_deadline: "2027-01-15", ...extra,
}, now);

test("intake families recognize supported semester wording", () => {
  for (const value of ["Wintersemester", "Hiver 2027", "WS", "WS 2027", "Prépa WS 2027"]) {
    assert.equal(applicationIntakeFamily(value), "winter");
  }
  for (const value of ["Sommersemester", "Été 2027", "SS", "SS 2027", "Prépa Été 2027"]) {
    assert.equal(applicationIntakeFamily(value), "summer");
  }
  assert.equal(applicationIntakeFamily("rolling"), null);
});

test("target intake selects its matching deadline", () => {
  const winter = resolve({ intake_terms: ["Wintersemester", "Sommersemester"], target_intake: "Hiver 2027" });
  const summer = resolve({ intake_terms: ["Wintersemester", "Sommersemester"], target_intake: "Sommersemester" });
  assert.deepEqual([winter.status, winter.intake, winter.deadline], ["resolved", "Wintersemester", "2027-07-15"]);
  assert.deepEqual([summer.status, summer.intake, summer.deadline], ["resolved", "Sommersemester", "2027-01-15"]);
});

test("single intake may resolve with an unknown deadline", () => {
  const result = resolve({ target_intake: null, winter_deadline: null, summer_deadline: "2027-01-15" });
  assert.deepEqual([result.status, result.intake, result.deadline], ["resolved", "Wintersemester", null]);
});

test("ambiguous, incompatible and unstructured intakes fail closed", () => {
  const cases = [
    resolve({ target_intake: null, intake_terms: ["Wintersemester", "Sommersemester"] }),
    resolve({ target_intake: "Sommersemester", intake_terms: ["Wintersemester"] }),
    resolve({ target_intake: "Wintersemester", intake_terms: ["rolling"] }),
  ];
  assert.equal(cases.every((result) => result.status === "needs_manual_review"), true);
});

test("invalid or past deadlines are never silently persisted", () => {
  assert.equal(resolve({ winter_deadline: "2027-02-30" }).status, "needs_manual_review");
  assert.equal(resolve({ winter_deadline: "2026-09-24" }).status, "deadline_passed");
  assert.equal(resolve({ winter_deadline: "2026-09-25" }).status, "resolved");
});

test("Student route uses project target intake and has no winter-first fallback", () => {
  const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");
  for (const pattern of [/from\("student_projects"\)/, /select\("target_intake"\)/, /resolveApplicationIntake/, /application_deadline_passed/]) {
    assert.match(route, pattern);
  }
  assert.doesNotMatch(route, /winter_deadline\s*\|\|\s*program\?\.summer_deadline/);
  assert.doesNotMatch(route, /intake_terms\) \? program\.intake_terms\[0\]/);
  assert.doesNotMatch(route, /status:\s*"rejection"/);
  assert.match(route, /status:\s*"interested"/);
});
