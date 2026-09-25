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

test("operational history remains read-only in this microtask", () => {
  assert.doesNotMatch(panel, /required_documents.*onChange/s);
  assert.doesNotMatch(panel, /result.*onChange/s);
  assert.doesNotMatch(panel, /submitted_at.*onChange/s);
});
