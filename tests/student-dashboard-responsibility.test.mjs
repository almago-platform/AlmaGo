import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/student/page.tsx", "utf8");

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
    /hasRecordedNextStep = Boolean\(actionableApplication\?\.next_action \|\| nextItem\)/,
  );
  assert.match(dashboard, /label="À corriger par vous"/);
  assert.match(dashboard, /label="Chez AlmaGo"/);
});
