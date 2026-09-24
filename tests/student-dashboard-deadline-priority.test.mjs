import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const applicationsPage = readFileSync("src/app/student/applications/page.tsx", "utf8");
const applicationsPanel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");

test("student dashboard gives real deadlines priority before generic next steps", () => {
  const documentCorrection = dashboard.indexOf("const nextAction = documentsNeedingAction");
  const overdueDeadline = dashboard.indexOf(": deadlineOverdue && nextApplication?.deadline");
  const soonDeadline = dashboard.indexOf(": deadlineSoon && nextApplication?.deadline");
  const recordedAction = dashboard.indexOf(": actionableApplication?.next_action?.trim()");
  const checklist = dashboard.indexOf(": nextItem");
  const almaGoReview = dashboard.indexOf(": documentsUnderReview");

  assert.ok(documentCorrection >= 0);
  assert.ok(overdueDeadline > documentCorrection);
  assert.ok(soonDeadline > overdueDeadline);
  assert.ok(recordedAction > soonDeadline);
  assert.ok(checklist > recordedAction);
  assert.ok(almaGoReview > checklist);
});

test("student dashboard uses Berlin deadline helpers and a seven-day window", () => {
  assert.match(dashboard, /daysUntilDeadline/);
  assert.match(dashboard, /isPastDeadline/);
  assert.match(dashboard, /nextDeadlineDays >= 0 && nextDeadlineDays <= 7/);
  assert.match(dashboard, /formatDeadline\(nextApplication\.deadline\)/);
});

test("deadline priority never claims the student is responsible without structured evidence", () => {
  const explicitStudentOwnerCount = (dashboard.match(/owner: "À faire par vous"/g) || []).length;
  assert.equal(explicitStudentOwnerCount, 1);
  assert.match(dashboard, /owner: "Échéance à vérifier"/);
  assert.match(dashboard, /owner: "Échéance enregistrée"/);
  assert.doesNotMatch(dashboard, /owner: "À faire par vous".*Échéance/s);
});

test("student deadline priority routes to the existing deadline center", () => {
  assert.match(dashboard, /href: "\/student\/echeances"/);
  assert.match(applicationsPanel, /href="\/student\/echeances"[^>]*>Voir mes échéances/);
});

test("student application histories explicitly keep only student-visible events", () => {
  assert.match(applicationsPage, /application_events\(id,event_type,message,visible_to_student,created_at\)/);
  assert.match(dashboard, /application_events\(id,event_type,message,visible_to_student,created_at\)/);
  assert.match(dashboard, /event\.visible_to_student === true/);
  assert.match(applicationsPanel, /event\.visible_to_student === true/);
});
