import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const team = read("src/app/admin/team/page.tsx");
const shell = read("src/components/layout/AppShell.tsx");
const dashboard = read("src/app/admin/page.tsx");

test("Admin V9 adds team workload to Pilotage", () => {
  assert.match(shell, /href: "\/admin\/team"/);
  assert.match(shell, /label: "Équipe"/);
  assert.match(shell, /Charge et attribution/);
  assert.match(dashboard, /Voir l’équipe/);
});

test("Admin V9 team page is built from the existing person workflow rather than a parallel CRM", () => {
  for (const source of [
    'from("user_roles")',
    'from("customer_access")',
    'from("student_intake_cases")',
    'from("student_case_assignments")',
    'from("student_checklist_items")',
    'from("applications")',
    'from("student_case_notes")',
  ]) {
    assert.ok(team.includes(source), source);
  }
  assert.doesNotMatch(team, /from\("(crm|people|contacts)"\)/i);
});

test("Admin V9 team view exposes manager-level workload signals", () => {
  for (const label of [
    "Dossiers actifs",
    "En retard",
    "Aujourd’hui",
    "Sans action",
    "Sans contact",
    "Non attribués",
    "Mes dossiers",
  ]) {
    assert.ok(team.includes(label), label);
  }
  assert.match(team, /Portefeuilles de l’équipe/);
  assert.match(team, /Ouvrir le portefeuille/);
});

test("Admin V9 workload keeps deadline provenance safeguards", () => {
  assert.match(team, /actionDeadlineIsTrusted/);
  assert.match(team, /applicationDeadlineIsTrusted/);
  assert.match(team, /official_source_url/);
  assert.match(team, /official_source_verified_at/);
  assert.match(team, /deadline_source_url/);
  assert.match(team, /deadline_verified_at/);
  assert.match(team, /deadline_cycle/);
  assert.match(team, /échéances officielles vérifiées ou les cibles internes/);
});

test("Admin V9 workload links back to the existing People center for action", () => {
  assert.match(team, /\/admin\/people\?work=unassigned/);
  assert.match(team, /\/admin\/people\?work=mine/);
  assert.match(team, /\/admin\/people\?advisor=/);
  assert.match(team, /\/admin\/people\?work=stale/);
});
