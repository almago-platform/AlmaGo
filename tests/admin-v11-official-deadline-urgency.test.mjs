import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const risk = read("src/lib/admin/application-risk.ts");
const dashboard = read("src/app/admin/page.tsx");
const people = read("src/app/admin/people/page.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const team = read("src/app/admin/team/page.tsx");

test("Admin V11 official deadline urgency only uses verified hard deadlines before submission", () => {
  assert.match(risk, /applicationOfficialDeadlineUrgency/);
  assert.match(risk, /!isActiveApplication\(application\.status\)/);
  assert.match(risk, /isSubmittedApplicationStatus\(application\.status\)/);
  assert.match(risk, /!application\.deadlineTrusted/);
  assert.match(risk, /application\.deadline_kind !== "official_hard_deadline"/);
});

test("Admin V11 models overdue and J-3 J-7 J-14 J-30 official urgency windows", () => {
  for (const token of ['"overdue"', '"d3"', '"d7"', '"d14"', '"d30"']) {
    assert.ok(risk.includes(token), token);
  }
  assert.match(risk, /daysRemaining < 0/);
  assert.match(risk, /daysRemaining <= 3/);
  assert.match(risk, /daysRemaining <= 7/);
  assert.match(risk, /daysRemaining <= 14/);
  assert.match(risk, /daysRemaining <= 30/);
});

test("Admin V11 dashboard exposes cumulative official deadline queues", () => {
  for (const href of [
    "/admin/people?work=official_overdue",
    "/admin/people?work=official_3",
    "/admin/people?work=official_7",
    "/admin/people?work=official_14",
    "/admin/people?work=official_30",
  ]) {
    assert.ok(dashboard.includes(href), href);
  }
  assert.match(dashboard, /Deadlines officielles vérifiées/);
  assert.match(dashboard, /Une date non vérifiée reste hors de ces alertes/);
  assert.match(dashboard, /officialOverdueCases/);
  assert.match(dashboard, /officialD3Cases/);
  assert.match(dashboard, /officialD7Cases/);
  assert.match(dashboard, /officialD14Cases/);
  assert.match(dashboard, /officialD30Cases/);
});

test("Admin V11 People supports official deadline urgency filters and badges", () => {
  for (const work of [
    '"official_overdue"',
    '"official_3"',
    '"official_7"',
    '"official_14"',
    '"official_30"',
  ]) {
    assert.ok(people.includes(work), work);
  }
  assert.match(people, /officialDeadlineUrgency/);
  assert.match(people, /applicationOfficialDeadlineUrgencyLabel/);
  assert.match(people, /Deadline officielle ≤ 3 j/);
  assert.match(people, /Deadline officielle ≤ 30 j/);
});

test("Admin V11 applications stop treating already-submitted applications as overdue preparation", () => {
  assert.match(applications, /applicationOfficialDeadlineUrgency/);
  assert.match(applications, /officialDeadlineUrgencies/);
  assert.match(applications, /Officielles dépassées/);
  assert.match(applications, /Officielles ≤ 30 j/);
  assert.doesNotMatch(applications, /isPastDeadline/);
});

test("Admin V11 Dossier 360 escalates overdue and imminent verified official deadlines", () => {
  assert.match(dossier, /applicationOfficialDeadlineUrgency/);
  assert.match(dossier, /application-official-overdue/);
  assert.match(dossier, /application-official-urgent/);
  assert.match(dossier, /Escalader maintenant/);
  assert.match(dossier, /Sécuriser le dépôt/);
});

test("Admin V11 Team cockpit exposes official deadline escalation signals", () => {
  assert.match(team, /officialOverdueStudentIds/);
  assert.match(team, /officialD7StudentIds/);
  assert.match(team, /\/admin\/people\?work=official_overdue/);
  assert.match(team, /\/admin\/people\?work=official_7/);
  assert.match(team, /Deadlines dépassées/);
  assert.match(team, /Deadline ≤ 7 j/);
});

test("Admin V11 deadline urgency is anchored to the Europe/Berlin calendar day", () => {
  assert.match(risk, /campusTodayDateKey/);
  assert.match(risk, /timeZone: "Europe\/Berlin"/);
  assert.match(dashboard, /campusTodayDateKey\(now\)/);
  assert.match(people, /campusTodayDateKey\(\)/);
  assert.match(applications, /campusTodayDateKey\(\)/);
  assert.match(dossier, /campusTodayDateKey\(\)/);
  assert.match(team, /campusTodayDateKey\(\)/);
});

test("Admin V11 centralizes official deadline truth instead of trusting non-null provenance fields", () => {
  assert.match(risk, /applicationDateIsTrusted/);
  assert.match(risk, /adminActionDateIsTrusted/);
  assert.match(risk, /evaluateCampusApplicationDeadline/);
  assert.match(risk, /evaluateCampusOfficialDeadline/);
  assert.match(risk, /evaluation\.status === "open" \|\| evaluation\.status === "closed"/);

  assert.match(dashboard, /adminActionDateIsTrusted/);
  assert.match(dashboard, /applicationDateIsTrusted/);
  assert.match(people, /adminActionDateIsTrusted/);
  assert.match(people, /applicationDateIsTrusted/);
  assert.match(applications, /applicationDateIsTrusted/);
  assert.match(dossier, /applicationDateIsTrusted/);
  assert.match(team, /adminActionDateIsTrusted/);
  assert.match(team, /applicationDateIsTrusted/);
});
