import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const helper = readFileSync("tests/e2e/auth-test-helpers.mjs", "utf8");
const isolation = readFileSync("tests/e2e/authenticated.spec.mjs", "utf8");
const student = readFileSync("tests/e2e/student-space-quality.spec.mjs", "utf8");
const admin = readFileSync("tests/e2e/admin-space-quality.spec.mjs", "utf8");

test("A43 login helper is role-aware", () => {
  assert.match(helper, /expectedArea === "admin"/);
  assert.match(helper, /\/admin/);
  assert.match(helper, /\/student/);
});

test("A43 authenticated navigation avoids networkidle", () => {
  for (const source of [helper, isolation, student, admin]) {
    assert.doesNotMatch(source, /waitUntil:\s*"networkidle"/);
  }
});

test("A43 matrices use realistic per-test timeouts", () => {
  assert.match(isolation, /test\.setTimeout\(60_000\)/);
  assert.match(student, /test\.setTimeout\(180_000\)/);
  assert.match(admin, /test\.setTimeout\(180_000\)/);
});

test("A43 admin login explicitly waits for the admin area", () => {
  assert.match(isolation, /adminPassword, "admin"/);
  assert.match(admin, /adminPassword, "admin"/);
});
