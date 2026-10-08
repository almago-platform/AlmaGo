import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { buildUnifiedDossierHistory } from "../src/lib/admin/dossier-history.ts";

const dossier = readFileSync("src/app/admin/dossiers/[studentId]/page.tsx", "utf8");
const historyView = readFileSync("src/components/admin/AdminDossierHistory.tsx", "utf8");
const model = readFileSync("src/lib/admin/dossier-history.ts", "utf8");

function fixture() {
  return {
    history: [
      { id: "audit-1", event_type: "orientation_reviewed", message: "Orientation vérifiée", created_at: "2026-10-03T08:00:00Z" },
    ],
    messages: [
      { id: "msg-1", sender_role: "student", body: "Mon certificat est envoyé", attachment_name: "certificat.pdf", created_at: "2026-10-05T10:45:00Z" },
    ],
    notes: [
      { id: "note-1", kind: "call", content: "Appel effectué", occurred_at: "2026-10-04T11:00:00Z", created_at: "2026-10-08T12:00:00Z", author_name: "Conseiller 1" },
    ],
    documents: [
      { id: "doc-1", category: "language_certificate", original_filename: "certificat.pdf", status: "approved", created_at: "2026-10-05T10:50:00Z" },
    ],
    applications: [{
      id: "app-1", programName: "Licence Informatique", created_at: "2026-10-02T10:00:00Z",
      application_events: [
        { id: "app-event-1", event_type: "application_status_changed", message: "Statut modifié", visible_to_student: false, created_at: "2026-10-07T09:00:00Z" },
      ],
    }],
  };
}

test("UX-3 merges actual events and orders by raw timestamps, not formatted French labels", () => {
  const events = buildUnifiedDossierHistory(fixture());
  assert.deepEqual(events.map((item) => item.id), [
    "application-event:app-event-1", "document:doc-1", "message:msg-1",
    "note:note-1", "history:audit-1", "application:app-1",
  ]);
  assert.deepEqual(new Set(events.map((item) => item.category)),
    new Set(["suivi", "messages", "notes", "documents", "candidatures"]));
  assert.equal(events.find((item) => item.id === "note:note-1").recordedAt, "2026-10-08T12:00:00Z");
  assert.equal(events.find((item) => item.id === "note:note-1").actor, "Conseiller 1");
  assert.equal(events.find((item) => item.id === "note:note-1").href, "#journal");
  assert.match(events.find((item) => item.id === "message:msg-1").detail, /certificat.pdf/);
  assert.match(events.find((item) => item.id === "document:doc-1").currentStatus, /^État actuel/);
  assert.match(events.find((item) => item.id === "application-event:app-event-1").source, /interne/);
});

test("UX-3 suppresses only provable duplicates while preserving distinct evidence", () => {
  const input = fixture();
  input.messages.push({ ...input.messages[0] });
  input.history.push({
    id: "audit-mirror", event_type: "application_status_changed",
    message: "Statut modifié", created_at: "2026-10-07T09:00:00Z",
  });
  input.history.push({
    id: "audit-other", event_type: "application_status_changed",
    message: "Autre décision", created_at: "2026-10-07T09:00:00Z",
  });
  const result = buildUnifiedDossierHistory(input);
  assert.equal(result.filter((item) => item.id === "message:msg-1").length, 1);
  assert.equal(result.filter((item) => item.id === "history:audit-mirror").length, 0);
  assert.equal(result.filter((item) => item.id === "history:audit-other").length, 1);
  assert.equal(result.filter((item) => item.id === "application-event:app-event-1").length, 1);
});

test("UX-3 does not manufacture admission, visa, status history or activity from empty inputs", () => {
  const empty = buildUnifiedDossierHistory({
    history: [], messages: [], notes: [], documents: [], applications: [],
  });
  assert.deepEqual(empty, []);
  const events = buildUnifiedDossierHistory(fixture());
  assert.equal(events.find((item) => item.id === "application:app-1").title, "Candidature enregistrée");
  assert.equal(events.find((item) => item.id === "document:doc-1").currentStatus, "État actuel : Approuvé");
  assert.ok(events.every((item) => item.id && item.source && item.href.startsWith("#")));
  assert.doesNotMatch(model, /visa (approuvé|obtenu)|admission garantie/i);
});

test("UX-3 retains only factual legacy activity when no system history exists", () => {
  const input = fixture();
  input.history = [];
  input.legacyFallback = {
    orientation: { id: "ori-1", createdAt: "2026-10-01T10:00:00Z", detail: "Projet enregistré" },
    studentResponse: { createdAt: "2026-10-02T10:00:00Z", detail: "Réponse reçue" },
    purchase: { id: "buy-1", createdAt: "2026-10-03T10:00:00Z", detail: "Achat enregistré" },
  };
  const result = buildUnifiedDossierHistory(input);
  assert.ok(result.some((event) => event.id === "orientation:ori-1" && event.href === "#orientation"));
  assert.ok(result.some((event) => event.id.startsWith("intake-response:") && event.actor === "Étudiant"));
  assert.ok(result.some((event) => event.id === "purchase:buy-1" && event.href === "#commercial"));
  input.history = [{ id: "h1", event_type: "orientation_created", message: "Réel", created_at: "2026-10-01T10:00:00Z" }];
  assert.ok(buildUnifiedDossierHistory(input).every((event) => !event.id.startsWith("orientation:")
    && !event.id.startsWith("purchase:") && !event.id.startsWith("intake-response:")));
});

test("UX-3 filters and pagination remain local, accessible, and return to original dossier anchors", () => {
  assert.match(dossier, /buildUnifiedDossierHistory\(\{/);
  assert.match(dossier, /<AdminDossierHistory events=\{unifiedHistory\} \/>/);
  assert.match(dossier, /id="history"/);
  assert.match(dossier, /from\("student_history"\)/);
  assert.match(dossier, /from\("student_case_notes"\)/);
  assert.match(dossier, /from\("student_dossier_messages"\)/);
  for (const s of ["#messages", "#journal", "#documents", "#applications", "#history"]) {
    assert.ok(model.includes(s), s);
  }
  assert.match(historyView, /type="date"/);
  assert.match(historyView, /<select/);
  assert.match(historyView, /aria-live="polite"/);
  assert.match(historyView, /filtered\.slice\(0, limit\)/);
  assert.match(historyView, /setLimit\(\(previous\) => previous \+ 20\)/);
  assert.match(historyView, /Vue des données déjà chargées/);
  assert.match(historyView, /Cette frise n’est pas un export exhaustif/);
  for (const source of [model, historyView]) {
    assert.doesNotMatch(source, /supabase|service_role|\.insert\(|\.update\(|fetch\(/);
  }
  assert.match(dossier, /Enregistrement retiré des opérations/);
});
