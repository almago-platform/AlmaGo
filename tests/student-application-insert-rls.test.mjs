import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("docs/student-application-insert-rls-proposal.md", "utf8");
const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");
const verification = readFileSync("src/lib/source-verification.ts", "utf8");
const migration = readFileSync("supabase/migrations/0011_phase4_orientation_applications.sql", "utf8");

test("application INSERT RLS proposal is explicitly non-applied", () => {
  assert.match(proposal, /PROPOSAL — \*\*NOT APPLIED\*\*/);
  assert.match(proposal, /Candidate SQL — DO NOT APPLY/);
});

test("current application route already enforces publishability", () => {
  assert.match(route, /isPublishableProgram/);
  assert.match(route, /recommendation\.is_archived/);
  assert.match(route, /recommendation\.status === "not_recommended"/);
  assert.match(verification, /program\?\.is_active === true/);
  assert.match(verification, /university\?\.is_active === true/);
  assert.match(verification, /hasVerifiedProgramSource/);
});

test("proposal checks product role and full programme publication boundary", () => {
  assert.match(proposal, /role_row\.role = 'student'/);
  assert.match(proposal, /program\.is_active = true/);
  assert.match(proposal, /university\.is_active = true/);
  assert.match(proposal, /program\.verified_at is not null/);
  assert.match(proposal, /recommendation\.is_archived = false/);
  assert.match(proposal, /recommendation\.status <> 'not_recommended'/);
});

test("proposal avoids coupling the public policy directly to catalogue RLS", () => {
  assert.match(proposal, /private\.can_student_create_application/);
  assert.match(proposal, /SECURITY DEFINER/);
  assert.match(proposal, /risks a policy dependency cycle|risks a policy dependency cycle/i);
});

test("proposal keeps initial student application status constrained", () => {
  assert.match(proposal, /status = 'interested'/);
  assert.match(migration, /applications student from recommendation/);
});

test("proposal documents remaining broad INSERT field integrity separately", () => {
  assert.match(proposal, /Adjacent INSERT-integrity finding/);
  assert.match(proposal, /`result`/);
  assert.match(proposal, /`reviewed_at`/);
  assert.match(proposal, /not silently solved by this proposal/);
});
