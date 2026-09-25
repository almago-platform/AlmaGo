import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("docs/catalogue-rls-read-boundary-proposal.md", "utf8");
const orientation = readFileSync("src/app/student/orientation/page.tsx", "utf8");
const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const applications = readFileSync("src/app/student/applications/page.tsx", "utf8");
const createApplication = readFileSync("src/app/api/student/applications/route.ts", "utf8");
const adminPrograms = readFileSync("src/app/admin/programs/page.tsx", "utf8");
const adminUniversities = readFileSync("src/app/admin/universities/page.tsx", "utf8");

test("catalogue RLS proposal is explicitly non-applied", () => {
  assert.match(proposal, /PROPOSAL — \*\*NOT APPLIED\*\*/);
  assert.match(proposal, /DO NOT APPLY WITHOUT EXPLICIT DATABASE REVIEW/);
});

test("student discovery keeps the application-level publishability guard", () => {
  assert.match(orientation, /isPublishableProgram/);
  assert.match(dashboard, /isPublishableProgram/);
  assert.match(createApplication, /isPublishableProgram/);
});

test("student application history still requires catalogue context", () => {
  assert.match(
    applications,
    /programs\(name,degree_level,universities\(name,city\)\)/,
  );
  assert.match(dashboard, /applications"\)\.select\("id,status,deadline,next_action,programs\(name\)/);
});

test("admin catalogue pages still require full-table reads", () => {
  assert.match(adminPrograms, /from\("programs"\)/);
  assert.match(adminUniversities, /from\("universities"\)/);
});

test("proposal preserves historical application access without making it publishable", () => {
  assert.match(proposal, /own historical application to inactive\/unverified programme/);
  assert.match(proposal, /does not make the row publishable again/);
  assert.match(proposal, /private\.can_student_read_program/);
  assert.match(proposal, /private\.can_student_read_university/);
});
