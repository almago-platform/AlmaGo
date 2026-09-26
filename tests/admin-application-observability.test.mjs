import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/admin/applications/page.tsx", "utf8");
const panel = readFileSync("src/components/admin/AdminApplicationsPanel.tsx", "utf8");

test("Admin application query loads existing operational evidence without adding writes", () => {
  for (const field of ["required_documents", "result", "submitted_at", "application_events"]) {
    assert.match(page, new RegExp(field));
  }
  assert.match(page, /visible_to_student/);
});

test("Admin UI exposes stored submission, documents and result as recorded facts", () => {
  assert.match(panel, /Envoyée le/);
  assert.match(panel, /Documents attendus/);
  assert.match(panel, /Résultat enregistré/);
  assert.match(panel, /Historique enregistré/);
});

test("event visibility is explicit for Admin reviewers", () => {
  assert.match(panel, /Visible étudiant/);
  assert.match(panel, /Interne/);
  assert.match(panel, /event\.visible_to_student/);
});

test("operational evidence stays outside the Admin edit contract", () => {
  const editContract = panel.match(/type ApplicationEdit = \{[\s\S]*?\};/)?.[0] || "";
  assert.doesNotMatch(editContract, /required_documents|result|submitted_at/);
  assert.doesNotMatch(panel, /setRequiredDocuments|setResult|setSubmittedAt/);
});


test("Admin application cards expose the factual workflow stage and recorded next action", () => {
  assert.match(panel, /studentApplicationStageLabel\(application\.status\)/);
  assert.match(panel, /Étape actuelle/);
  assert.match(panel, /Prochaine action enregistrée/);
  assert.match(panel, /Aucune prochaine action n’est enregistrée pour ce dossier actif/);
});

test("deadline copy is rendered only when an actual deadline exists", () => {
  assert.match(
    panel,
    /application\.deadline && \([\s\S]*?Échéance \{formatDeadline\(application\.deadline\)\}/,
  );
});

test("history remains chronologically scanned and explicitly scoped per application", () => {
  assert.match(panel, /String\(b\.created_at\)\.localeCompare\(String\(a\.created_at\)\)/);
  assert.match(panel, /Historique de/);
  assert.match(panel, /Visible étudiant/);
  assert.match(panel, /Interne/);
});

test("Admin UX does not invent decisions or admission probabilities", () => {
  assert.doesNotMatch(panel, /probabilit[ée] d['’]admission|chance d['’]admission|garantie d['’]admission/i);
  assert.match(panel, /décision communiquée par l’université/);
  assert.match(panel, /AlmaGo n’est pas l’auteur de cette décision/);
});
