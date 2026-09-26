import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationStatuses as phase4Statuses,
  isActiveApplication as phase4IsActiveApplication,
} from "../src/lib/phase4.ts";
import {
  applicationStatuses,
  applicationStatusLabels,
  historicalApplicationStatuses,
  allowedApplicationTransitions,
  canTransitionApplication,
  isActiveApplication,
  isUniversityDecisionStatus,
  normalizeApplicationStatus,
  transitionRequirements,
  transitionSetsSubmittedAt,
  isSubmittedApplicationStatus,
  studentApplicationStageLabel,
  studentApplicationStatusLabel,
} from "../src/lib/application-workflow.ts";

test("LOT 3 canonical statuses stay aligned with the existing application surface", () => {
  assert.deepEqual(applicationStatuses, phase4Statuses);
  assert.equal(applicationStatuses.includes("in_review"), false);
  assert.equal(historicalApplicationStatuses.includes("in_review"), true);
});

test("historical statuses stay readable but normalize into canonical workflow states", () => {
  assert.equal(normalizeApplicationStatus("draft"), "interested");
  assert.equal(normalizeApplicationStatus("planned"), "preparing");
  assert.equal(normalizeApplicationStatus("in_review"), "waiting_university");
  assert.equal(normalizeApplicationStatus("accepted"), "admission");
  assert.equal(normalizeApplicationStatus("rejected"), "rejection");
  assert.equal(normalizeApplicationStatus("unknown"), null);
});

test("active and terminal compatibility stays aligned with phase4", () => {
  for (const status of [...applicationStatuses, ...historicalApplicationStatuses]) {
    assert.equal(isActiveApplication(status), phase4IsActiveApplication(status), status);
  }
});

test("normal progression is allowed while dangerous jumps are refused", () => {
  assert.equal(canTransitionApplication("interested", "preparing"), true);
  assert.equal(canTransitionApplication("preparing", "documents_missing"), true);
  assert.equal(canTransitionApplication("documents_missing", "ready_to_submit"), true);
  assert.equal(canTransitionApplication("ready_to_submit", "submitted"), true);
  assert.equal(canTransitionApplication("submitted", "waiting_university"), true);
  assert.equal(canTransitionApplication("waiting_university", "admission"), true);
  assert.equal(canTransitionApplication("waiting_university", "rejection"), true);

  assert.equal(canTransitionApplication("interested", "admission"), false);
  assert.equal(canTransitionApplication("rejection", "preparing"), false);
  assert.equal(canTransitionApplication("waiting_university", "ready_to_submit"), false);
  assert.equal(canTransitionApplication("submitted", "submitted"), false);
});

test("terminal states expose no ordinary next transition", () => {
  for (const status of ["admission", "rejection", "withdrawn", "accepted", "rejected"]) {
    assert.deepEqual(allowedApplicationTransitions(status), []);
  }
});

test("preconditions are declarative and university decisions stay external", () => {
  assert.deepEqual(transitionRequirements("documents_missing", "ready_to_submit"), ["documents_complete"]);
  assert.deepEqual(transitionRequirements("ready_to_submit", "submitted"), ["submission_confirmed"]);
  assert.deepEqual(transitionRequirements("waiting_university", "admission"), ["university_decision_confirmed"]);
  assert.deepEqual(transitionRequirements("waiting_university", "rejection"), ["university_decision_confirmed"]);
  assert.equal(isUniversityDecisionStatus("admission"), true);
  assert.equal(isUniversityDecisionStatus("rejection"), true);
  assert.equal(isUniversityDecisionStatus("preparing"), false);
});

test("submitted_at is only set by the actual submission transition", () => {
  assert.equal(transitionSetsSubmittedAt("ready_to_submit", "submitted"), true);
  assert.equal(transitionSetsSubmittedAt("submitted", "waiting_university"), false);
  assert.equal(transitionSetsSubmittedAt("interested", "submitted"), false);
});

test("deadline state never manufactures a rejection transition", () => {
  assert.equal(canTransitionApplication("ready_to_submit", "rejection"), false);
  assert.equal(canTransitionApplication("submitted", "rejection"), false);
  assert.equal(canTransitionApplication("waiting_university", "rejection"), true);
});


test("student-facing labels normalize historical states without changing their stored value", () => {
  assert.equal(studentApplicationStatusLabel("interested"), "À préparer");
  assert.equal(studentApplicationStatusLabel("accepted"), "Admission enregistrée");
  assert.equal(studentApplicationStatusLabel("rejected"), "Résultat négatif enregistré");
  assert.equal(studentApplicationStatusLabel("unknown"), "Statut enregistré");
  assert.equal(studentApplicationStageLabel("in_review"), "Décision de l’université attendue");
});

test("submitted summary recognizes canonical and historical post-submission states", () => {
  for (const status of ["submitted", "waiting_university", "admission", "rejection", "in_review", "accepted", "rejected"]) {
    assert.equal(isSubmittedApplicationStatus(status), true, status);
  }
  for (const status of ["interested", "preparing", "documents_missing", "ready_to_submit", "withdrawn", "draft"]) {
    assert.equal(isSubmittedApplicationStatus(status), false, status);
  }
});


test("canonical and historical status namespaces stay disjoint and fully labelled", () => {
  const canonical = new Set(applicationStatuses);
  for (const status of historicalApplicationStatuses) {
    assert.equal(canonical.has(status), false, status);
  }

  for (const status of [...applicationStatuses, ...historicalApplicationStatuses]) {
    assert.equal(typeof applicationStatusLabels[status], "string", status);
    assert.notEqual(applicationStatusLabels[status].trim(), "", status);
  }
});

test("historical aliases never create a canonical no-op transition", () => {
  assert.equal(canTransitionApplication("draft", "interested"), false);
  assert.equal(canTransitionApplication("planned", "preparing"), false);
  assert.equal(canTransitionApplication("in_review", "waiting_university"), false);
  assert.equal(canTransitionApplication("accepted", "admission"), false);
  assert.equal(canTransitionApplication("rejected", "rejection"), false);
});

test("decision-note requirement is limited to real university decision transitions", () => {
  assert.deepEqual(transitionRequirements("waiting_university", "admission"), ["university_decision_confirmed"]);
  assert.deepEqual(transitionRequirements("waiting_university", "rejection"), ["university_decision_confirmed"]);
  assert.deepEqual(transitionRequirements("accepted", "admission"), []);
  assert.deepEqual(transitionRequirements("rejected", "rejection"), []);
});
