import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/admin/page.tsx", "utf8");

test("admin cockpit uses structured dossier and application states", () => {
  assert.match(dashboard, /\["rejected", "replace_required"\]/);
  assert.match(dashboard, /\["pending", "reviewed"\]/);
  assert.match(dashboard, /item\.status === "todo"/);
  assert.match(dashboard, /isActiveApplication/);
  assert.match(dashboard, /isPastDeadline/);
  assert.match(dashboard, /daysUntilDeadline/);
});

test("admin cockpit surfaces missing next actions without inventing one", () => {
  assert.match(dashboard, /!application\.next_action\?\.trim\(\)/);
  assert.match(dashboard, /ne génère pas lui-même une action ou une responsabilité/);
});

test("admin cockpit keeps checklist responsibility unassigned", () => {
  assert.match(dashboard, /Aucune responsabilité étudiant\/AlmaGo n’est déduite/);
  assert.match(dashboard, /sans responsable déduit/);
  assert.doesNotMatch(dashboard, /checklist.*À faire par vous/s);
});

test("admin cockpit has no scoring or broad data selection", () => {
  assert.doesNotMatch(dashboard, /riskScore|studentScore|rankingScore|admissionProbability/);
  assert.doesNotMatch(dashboard, /select\(\s*["']\*["']\s*\)/);
  assert.doesNotMatch(dashboard, /service_role/i);
  assert.doesNotMatch(dashboard, /auth\.admin/);
});

test("admin cockpit links to the unified student dossier center", () => {
  assert.match(dashboard, /href="\/admin\/students"/);
  assert.match(dashboard, /\/admin\/students\/\$\{event\.student_id\}/);
});
