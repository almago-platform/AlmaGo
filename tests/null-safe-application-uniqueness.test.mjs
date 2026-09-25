import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("docs/null-safe-application-uniqueness-proposal.md", "utf8");
const route = readFileSync("src/app/api/student/applications/route.ts", "utf8");
const migration = readFileSync("supabase/migrations/0001_initial_schema.sql", "utf8");

test("NULL-safe uniqueness proposal is explicitly non-applied", () => {
  assert.match(proposal, /PROPOSAL — \*\*NOT APPLIED\*\*/);
  assert.match(proposal, /Candidate migration — DO NOT APPLY/);
});

test("proposal uses PostgreSQL native NULLS NOT DISTINCT", () => {
  assert.match(proposal, /unique nulls not distinct \(student_id, program_id, intake\)/i);
  assert.match(proposal, /PostgreSQL \*\*17\.6\*\*/);
  assert.match(proposal, /postgresql\.org\/docs\/17\/sql-altertable\.html/);
});

test("current route keeps explicit duplicate checks for null and known intake", () => {
  assert.match(route, /intake === null/);
  assert.match(route, /existingApplicationQuery\.is\("intake", null\)/);
  assert.match(route, /existingApplicationQuery\.eq\("intake", intake\)/);
});

test("current route keeps the database unique violation as concurrency fallback", () => {
  assert.match(route, /error\.code === "23505"/);
  assert.match(route, /status: error\.code === "23505" \? 409 : 500/);
});

test("current migration still contains the older NULL-distinct unique constraint", () => {
  assert.match(migration, /unique \(student_id, program_id, intake\)/i);
  assert.doesNotMatch(migration, /unique nulls not distinct/i);
});

test("proposal requires duplicate preflight before replacing the constraint", () => {
  assert.match(proposal, /having count\(\*\) > 1/);
  assert.match(proposal, /do not drop\/replace the constraint/i);
});
