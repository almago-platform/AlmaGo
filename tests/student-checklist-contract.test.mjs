import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");

test("student checklist uses only real persisted states", () => {
  assert.match(checklist, /todo: "Étape à faire"/);
  assert.match(checklist, /completed: "Terminée"/);
  assert.doesNotMatch(checklist, /waiting_student/);
  assert.doesNotMatch(checklist, /waiting_almago/);
  assert.doesNotMatch(checklist, /in_progress/);
  assert.doesNotMatch(checklist, /not_started/);
});

test("student checklist does not invent who owns an open step", () => {
  assert.match(checklist, /Étape ouverte/);
  assert.match(checklist, /Démarche enregistrée/);
  assert.match(checklist, /Cette liste n’attribue pas automatiquement un responsable/);
  assert.doesNotMatch(checklist, /À faire par vous/);
  assert.doesNotMatch(checklist, /En cours chez AlmaGo/);
});
