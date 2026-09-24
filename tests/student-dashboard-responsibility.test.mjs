import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/student/page.tsx", "utf8");
const checklistPage = readFileSync("src/app/student/checklist/page.tsx", "utf8");

test("student dashboard uses only real checklist states", () => {
  assert.match(dashboard, /item\.status === "completed"/);
  assert.match(dashboard, /item\.status === "todo"/);
  assert.doesNotMatch(dashboard, /waiting_student/);
  assert.doesNotMatch(dashboard, /waiting_almago/);
  assert.doesNotMatch(dashboard, /in_progress/);
  assert.doesNotMatch(dashboard, /not_started/);
});

test("student dashboard attributes responsibility only when structured data supports it", () => {
  assert.match(
    dashboard,
    /\["rejected", "replace_required"\]\.includes\(document\.status\)/,
  );
  assert.match(
    dashboard,
    /\["pending", "reviewed"\]\.includes\(document\.status\)/,
  );

  assert.match(dashboard, /owner: "Prochaine action enregistrée"/);
  assert.match(dashboard, /owner: "Étape enregistrée"/);
  assert.match(dashboard, /owner: "À faire par vous"/);

  const explicitStudentOwnerCount = (dashboard.match(/owner: "À faire par vous"/g) || []).length;
  assert.equal(explicitStudentOwnerCount, 1);
});

test("student dashboard keeps checklist and application next steps factual", () => {
  assert.doesNotMatch(dashboard, /studentActionCount/);
  assert.match(dashboard, /hasStudentActionRequired = documentsNeedingAction > 0/);
  assert.match(
    dashboard,
    /hasRecordedNextStep = Boolean\(actionableApplication\?\.next_action\?\.trim\(\) \|\| nextItem\)/,
  );
  assert.match(dashboard, /owner: "Échéance à vérifier"/);
  assert.match(dashboard, /owner: "Échéance enregistrée"/);
  assert.match(dashboard, /owner: "Chez AlmaGo"/);
  assert.match(dashboard, /label="À corriger par vous"/);
  assert.match(dashboard, /label="Chez AlmaGo"/);
});


test("student checklist uses only the real todo-completed workflow", () => {
  assert.match(checklistPage, /todo: "Étape à faire"/);
  assert.match(checklistPage, /completed: "Terminée"/);
  for (const legacy of ["waiting_student", "waiting_almago", "in_progress", "not_started"]) {
    assert.doesNotMatch(checklistPage, new RegExp(legacy));
  }
  assert.doesNotMatch(checklistPage, /À faire par vous/);
  assert.doesNotMatch(checklistPage, /En cours chez AlmaGo/);
  assert.match(checklistPage, /Prochaine étape enregistrée/);
  assert.match(checklistPage, /Étapes ouvertes/);
});


test("checklist never exposes an unknown raw status code", () => {
  const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
  assert.match(checklist, /labels\[item\.status\] \|\| "Statut à vérifier"/);
  assert.doesNotMatch(checklist, /labels\[item\.status\] \|\| item\.status/);
});
