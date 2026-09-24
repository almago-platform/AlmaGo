import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const helper = readFileSync("src/lib/admin/student-case.ts", "utf8");
const detailPage = readFileSync("src/app/admin/students/[id]/page.tsx", "utf8");
const detailComponent = readFileSync("src/components/admin/AdminStudentCase.tsx", "utf8");
const listPage = readFileSync("src/app/admin/students/page.tsx", "utf8");

test("student-case helper keeps responsibility based on structured document states", () => {
  assert.match(helper, /\["rejected", "replace_required"\]/);
  assert.match(helper, /\["pending", "reviewed"\]/);
  assert.match(helper, /item\.status === "todo"/);
  assert.match(helper, /item\.status === "completed"/);
});

test("student-case helper selects dates and recorded actions deterministically", () => {
  assert.match(helper, /localeCompare\(String\(b\.deadline\)\)/);
  assert.match(helper, /Boolean\(application\.next_action\?\.trim\(\)\)/);
  assert.match(helper, /String\(a\.created_at \|\| ""\)\.localeCompare/);
});

test("admin student case uses the existing active-application and Europe Berlin deadline contracts", () => {
  assert.match(detailComponent, /isActiveApplication/);
  assert.match(detailComponent, /isPastDeadline/);
  assert.match(detailComponent, /formatDeadline/);
  assert.match(listPage, /isActiveApplication/);
});

test("student-case implementation contains no score or ranking logic", () => {
  for (const source of [helper, detailPage, listPage]) {
    assert.doesNotMatch(source, /riskScore|studentScore|rankingScore|admissionProbability/);
  }
});
