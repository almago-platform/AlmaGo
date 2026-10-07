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

test("Admin V11 dashboard lists only assigned human actions as personal work", () => {
  assert.match(dashboard, /Mes prochaines actions/);
  assert.match(dashboard, /myHumanActions/);
  assert.match(dashboard, /item\.template_id === null/);
  assert.match(dashboard, /assignmentByStudent\.get\(item\.student_id\) === currentAdmin\.id/);
  assert.match(dashboard, /\/admin\/dossiers\/\$\{item\.student_id\}#actions/);
  assert.match(dashboard, /Les étapes système restent hors de cette liste/);
});

test("Admin V11 promotes explicitly blocked procedure cases into a dedicated work queue", () => {
  assert.match(dashboard, /blockedCaseIds/);
  assert.match(dashboard, /blockedCases/);
  assert.match(dashboard, /Dossiers bloqués/);
  assert.match(dashboard, /\/admin\/people\?work=blocked/);

  assert.match(people, /type WorkView = "all" \| "blocked"/);
  assert.match(people, /blockedActions/);
  assert.match(people, /work === "blocked"/);
  assert.match(people, /blocked: "Bloqués"/);
  assert.match(people, /Bloqué · \{person\.blockedActions\}/);
});

test("Admin V11 exposes who each dossier is waiting on without inventing student obligations", () => {
  for (const label of ["Attend Campus", "Attend étudiant", "Attend externe"]) {
    assert.ok(dashboard.includes(label), label);
    assert.ok(people.includes(label), label);
  }

  for (const href of [
    "/admin/people?work=waiting_campus",
    "/admin/people?work=waiting_student",
    "/admin/people?work=waiting_external",
  ]) {
    assert.ok(dashboard.includes(href), href);
  }

  assert.match(dashboard, /item\.status === "waiting_almago"/);
  assert.match(dashboard, /item\.status === "waiting_student"[\s\S]*item\.requires_student_action[\s\S]*item\.student_action_reason\?\.trim\(\)/);
  assert.match(dashboard, /item\.status === "waiting_external"/);

  assert.match(people, /work === "waiting_campus"/);
  assert.match(people, /work === "waiting_student"/);
  assert.match(people, /work === "waiting_external"/);
  assert.match(people, /item\.status === "waiting_student"[\s\S]*item\.requires_student_action[\s\S]*item\.student_action_reason\?\.trim\(\)/);
});

test("Admin V11 keeps direct student replies ahead of generic Campus waits", () => {
  assert.match(dashboard, /studentQuestions > 0/);
  assert.match(dashboard, /waitingCampusCases > 0/);
  assert.match(dashboard, /Étudiants attendent Campus/);
  assert.match(dashboard, /Traiter les attentes Campus/);
  assert.ok(
    dashboard.indexOf("studentQuestions > 0") < dashboard.indexOf("waitingCampusCases > 0"),
    "student replies should stay ahead of generic Campus waiting states",
  );
});

test("Admin V11 keeps the Team cockpit aligned with blocked and waiting-state queues", () => {
  for (const label of ["Bloqués", "Attend Campus", "Attend étudiant", "Attend externe"]) {
    assert.ok(team.includes(label), label);
  }

  assert.match(team, /blockedStudentIds/);
  assert.match(team, /waitingCampusStudentIds/);
  assert.match(team, /waitingStudentStudentIds/);
  assert.match(team, /waitingExternalStudentIds/);
  assert.match(team, /action\.status === "waiting_student"[\s\S]*action\.requires_student_action[\s\S]*action\.student_action_reason\?\.trim\(\)/);

  for (const href of [
    "/admin/people?work=blocked",
    "/admin/people?work=waiting_campus",
    "/admin/people?work=waiting_student",
    "/admin/people?work=waiting_external",
  ]) {
    assert.ok(team.includes(href), href);
  }
});
