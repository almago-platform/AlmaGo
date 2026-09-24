import assert from "node:assert/strict";
import test from "node:test";
import {
  applicationEventDisplayMessage,
  applicationStatusLabels,
  applicationStatuses,
  databaseApplicationStatuses,
  legacyApplicationStatuses,
  daysUntilDeadline,
  formatDeadline,
  isActiveApplication,
  isPastDeadline,
  nextActiveDeadline,
  studentHistoryDisplayMessage,
  terminalApplicationStatuses,
} from "../src/lib/phase4.ts";

test("canonical and legacy terminal applications cannot become current actions", () => {
  for (const status of ["admission", "accepted", "rejection", "rejected", "withdrawn"]) {
    assert.equal(isActiveApplication(status), false, status);
  }

  const canonicalActive = applicationStatuses.filter(
    (status) => !["admission", "rejection", "withdrawn"].includes(status),
  );
  for (const status of [...canonicalActive, "draft", "planned", "in_review"]) {
    assert.equal(isActiveApplication(status), true, status);
  }
});

test("unknown application states fail closed instead of becoming actionable", () => {
  for (const status of ["", "unknown", "processing_elsewhere", "ADMIN_OVERRIDE"]) {
    assert.equal(isActiveApplication(status), false, status);
  }
});

test("earliest active deadline excludes closed dossiers, invalid dates, and keeps overdue dates visible", () => {
  const applications = [
    { id: "closed", status: "admission", deadline: "2026-01-01" },
    { id: "later", status: "preparing", deadline: "2026-10-01" },
    { id: "invalid", status: "submitted", deadline: "2026-02-30" },
    { id: "none", status: "submitted", deadline: null },
    { id: "overdue", status: "documents_missing", deadline: "2026-09-01" },
  ];

  assert.equal(nextActiveDeadline(applications)?.id, "overdue");
  assert.deepEqual(applications.map(({ id }) => id), ["closed", "later", "invalid", "none", "overdue"]);
  assert.equal(nextActiveDeadline([{ status: "withdrawn", deadline: "2026-09-01" }]), undefined);
});

test("deadline changes to overdue at midnight in Berlin", () => {
  const beforeMidnight = new Date("2026-09-23T21:59:00Z");
  const afterMidnight = new Date("2026-09-23T22:01:00Z");
  assert.equal(isPastDeadline("2026-09-23", beforeMidnight), false);
  assert.equal(isPastDeadline("2026-09-23", afterMidnight), true);
  assert.equal(isPastDeadline("2026-09-24", afterMidnight), false);
});

test("invalid or missing deadlines are never treated as real deadlines", () => {
  for (const deadline of ["", "23-09-2026", "2026-13-01", "2026-02-30"]) {
    assert.equal(isPastDeadline(deadline), false, deadline);
    assert.equal(formatDeadline(deadline), "Date à confirmer", deadline);
  }
  assert.equal(formatDeadline(null), "Date à confirmer");
  assert.equal(formatDeadline(undefined), "Date à confirmer");
});


test("deadline countdown follows the same Berlin calendar day", () => {
  const beforeBerlinMidnight = new Date("2026-09-23T21:59:00Z");
  const afterBerlinMidnight = new Date("2026-09-23T22:01:00Z");

  assert.equal(daysUntilDeadline("2026-09-24", beforeBerlinMidnight), 1);
  assert.equal(daysUntilDeadline("2026-09-24", afterBerlinMidnight), 0);
  assert.equal(daysUntilDeadline("2026-09-23", afterBerlinMidnight), -1);
  assert.equal(daysUntilDeadline("2026-02-30", afterBerlinMidnight), null);
});


test("deadline countdown stays calendar-based across Berlin DST changes", () => {
  // Passage à l’heure d’été : 29 mars 2026.
  assert.equal(daysUntilDeadline("2026-03-30", new Date("2026-03-28T22:30:00Z")), 2);
  assert.equal(daysUntilDeadline("2026-03-30", new Date("2026-03-29T22:30:00Z")), 0);
  assert.equal(isPastDeadline("2026-03-29", new Date("2026-03-29T22:30:00Z")), true);

  // Retour à l’heure d’hiver : 25 octobre 2026.
  assert.equal(daysUntilDeadline("2026-10-26", new Date("2026-10-24T22:30:00Z")), 1);
  assert.equal(daysUntilDeadline("2026-10-26", new Date("2026-10-25T23:30:00Z")), 0);
});


test("deadline formatting is pinned to the Berlin calendar", () => {
  assert.equal(formatDeadline("2026-10-26"), "26 oct. 2026");
});


test("application status catalogues distinguish writable phase-4 states from legacy database states", () => {
  assert.deepEqual(
    new Set(applicationStatuses),
    new Set([
      "interested",
      "preparing",
      "documents_missing",
      "ready_to_submit",
      "submitted",
      "waiting_university",
      "admission",
      "rejection",
      "withdrawn",
    ]),
  );

  assert.deepEqual(
    new Set(legacyApplicationStatuses),
    new Set(["draft", "planned", "in_review", "accepted", "rejected"]),
  );

  assert.deepEqual(
    new Set(databaseApplicationStatuses),
    new Set([
      "draft",
      "planned",
      "submitted",
      "in_review",
      "accepted",
      "rejected",
      "withdrawn",
      "interested",
      "preparing",
      "documents_missing",
      "ready_to_submit",
      "waiting_university",
      "admission",
      "rejection",
    ]),
  );
});


test("every database application status is classified exactly once", () => {
  for (const status of databaseApplicationStatuses) {
    const active = isActiveApplication(status);
    const terminal = terminalApplicationStatuses.has(status);
    assert.notEqual(active, terminal, status);
  }
});


test("application status events are rendered with human labels", () => {
  assert.equal(
    applicationEventDisplayMessage("application_status_changed", "Candidature mise à jour : accepted"),
    "Nouveau statut : Acceptée",
  );
  assert.equal(
    applicationEventDisplayMessage("application_status_changed", "Candidature mise à jour : rejected"),
    "Nouveau statut : Refusée",
  );
  assert.equal(
    applicationEventDisplayMessage("application_status_changed", "Candidature mise à jour : in_review"),
    "Nouveau statut : En revue",
  );
  assert.equal(
    applicationEventDisplayMessage("application_status_changed", "Candidature mise à jour : future_state"),
    "Le statut de cette candidature a été mis à jour.",
  );
  assert.equal(
    applicationEventDisplayMessage("document_uploaded", "Document reçu"),
    "Document reçu",
  );
});


test("document history wording stays institutional", () => {
  assert.equal(
    studentHistoryDisplayMessage("AlmaGo a approuvé ton document : passeport.pdf."),
    "AlmaGo a validé votre document : passeport.pdf.",
  );
  assert.equal(
    studentHistoryDisplayMessage("AlmaGo a rejeté ton document : relevé.pdf."),
    "AlmaGo a demandé une correction pour votre document : relevé.pdf.",
  );
  assert.equal(
    studentHistoryDisplayMessage("AlmaGo te demande de remplacer ton document : bac.pdf."),
    "AlmaGo vous demande de remplacer votre document : bac.pdf.",
  );
  assert.equal(studentHistoryDisplayMessage("Message déjà professionnel."), "Message déjà professionnel.");
});


test("every database application status has a human label", () => {
  for (const status of databaseApplicationStatuses) {
    assert.equal(typeof applicationStatusLabels[status], "string", status);
    assert.ok(applicationStatusLabels[status].trim(), status);
    assert.notEqual(applicationStatusLabels[status], status, status);
  }
});
