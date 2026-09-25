import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync(
  "supabase/proposals/0014_application_null_safe_uniqueness.sql",
  "utf8",
);
const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");

test("NULL-safe application uniqueness stays proposal-only", () => {
  assert.match(proposal, /PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY/);
});

test("proposal replaces the legacy unique constraint with NULLS NOT DISTINCT", () => {
  assert.match(
    proposal,
    /drop constraint if exists applications_student_id_program_id_intake_key/,
  );
  assert.match(
    proposal,
    /unique nulls not distinct \(student_id, program_id, intake\)/,
  );
});

test("proposal does not mutate or delete application rows", () => {
  assert.doesNotMatch(proposal, /delete from public\.applications/i);
  assert.doesNotMatch(proposal, /update public\.applications/i);
  assert.doesNotMatch(proposal, /insert into public\.applications/i);
});

test("application route keeps database uniqueness conflict handling", () => {
  assert.match(route, /error\.code === "23505"/);
  assert.match(route, /status: error\.code === "23505" \? 409 : 500/);
  assert.match(route, /Une candidature existe déjà pour ce programme/);
});
