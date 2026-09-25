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
