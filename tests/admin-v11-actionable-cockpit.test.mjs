import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const people = read("src/app/admin/people/page.tsx");
const team = read("src/app/admin/team/page.tsx");

test("Admin V11 puts assigned and dated workload first on the dashboard", () => {
  for (const label of [
    "Mes dossiers",
    "En retard",
    "Aujourd’hui",
    "7 prochains jours",
    "Sans prochaine action",
    "Non attribués",
    "Sans contact 14 j",
  ]) {
    assert.ok(dashboard.includes(label), label);
  }

  for (const href of [
    "/admin/people?work=mine",
    "/admin/people?work=overdue",
    "/admin/people?work=today",
    "/admin/people?work=week",
  ]) {
    assert.ok(dashboard.includes(href), href);
  }
});

test("Admin V11 only treats manual checklist rows as explicit human actions", () => {
  assert.match(dashboard, /item\.template_id === null/);
  assert.match(people, /humanOpenActions = openActions\.filter\(\(item\) => item\.template_id === null\)/);
  assert.match(team, /isOpenAdminAction\(item\.status\) && item\.template_id === null/);
});

test("Admin V11 keeps deadline provenance safeguards for daily workload", () => {
  for (const source of [
    "official_source_url",
    "official_source_verified_at",
    "deadline_source_url",
    "deadline_verified_at",
    "deadline_cycle",
    "internal_target",
  ]) {
    assert.ok(dashboard.includes(source), source);
  }

  assert.match(dashboard, /actionDeadlineIsTrusted/);
  assert.match(dashboard, /applicationDeadlineIsTrusted/);
  assert.match(dashboard, /nearestDueByStudent/);
});

test("Admin V11 keeps dashboard counts linked to existing People work queues", () => {
  assert.match(dashboard, /assignmentByStudent/);
  assert.match(dashboard, /missingNextActionCases/);
  assert.match(dashboard, /overdueCases/);
  assert.match(dashboard, /todayCases/);
  assert.match(dashboard, /weekCases/);

  assert.match(people, /work === "overdue"/);
  assert.match(people, /work === "today"/);
  assert.match(people, /work === "week"/);
  assert.match(people, /work === "mine"/);
});
