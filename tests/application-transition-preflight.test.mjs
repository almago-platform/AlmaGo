import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/admin/applications/[id]/status/route.ts", "utf8");
const panel = readFileSync("src/components/admin/AdminApplicationsPanel.tsx", "utf8");

test("Admin API loads the current application before any status transition", () => {
  assert.match(route, /select\("status,next_action,student_notes"\)/);
  assert.match(route, /canTransitionApplication\(current\.status, targetStatus\)/);
  assert.match(route, /transitionRequirements\(current\.status, targetStatus\)/);
});

test("metadata-only updates do not call the status RPC", () => {
  assert.match(route, /if \(!statusChanged\)/);
  assert.match(route, /\.update\(\{[\s\S]*next_action:[\s\S]*student_notes:[\s\S]*reviewed_at:/);
  assert.match(route, /status_changed: false/);
});

test("real transitions require confirmation when the workflow contract requires it", () => {
  assert.match(route, /body\.transition_confirmed !== true/);
  assert.match(route, /Cette transition nécessite une confirmation explicite/);
  assert.match(route, /status_changed: true/);
});

test("university decisions require a visible note and never present AlmaGo as the decision maker", () => {
  assert.match(route, /targetStatus === "admission" \|\| targetStatus === "rejection"/);
  assert.match(route, /décision communiquée par l’université/);
  assert.match(panel, /AlmaGo n’est pas l’auteur de cette décision/);
});

test("Admin UI only proposes the current state plus allowed workflow targets", () => {
  assert.match(panel, /allowedApplicationTransitions\(application\.status\)/);
  assert.match(panel, /statusOptions = \[application\.status,/);
  assert.doesNotMatch(panel, /\{applicationStatuses\.map\(\(item\) => \([\s\S]{0,300}Mise à jour du dossier/);
});

test("required transitions are blocked in the UI until explicit confirmation", () => {
  assert.match(panel, /transitionRequirements\(application\.status, edit\.status\)/);
  assert.match(panel, /Confirmation requise/);
  assert.match(panel, /needsTransitionConfirmation && !edit\.transitionConfirmed/);
});


test("metadata-only database conflicts are translated instead of leaking as generic 500s", () => {
  assert.match(route, /function applicationDatabaseErrorResponse/);
  assert.match(route, /application_decision_note_required/);
  assert.match(route, /application_transition_not_allowed/);
  assert.match(route, /application_no_status_change/);
  assert.match(route, /application_not_found/);
  assert.match(route, /updateError,[\s\S]*Impossible de mettre à jour le suivi de la candidature/);
});
