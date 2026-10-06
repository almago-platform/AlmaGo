import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");
const workflow = read("src/components/admin/AdminWorkflowSection.tsx");

test("Admin V4 introduces a shared orientation-style workflow primitive", () => {
  assert.match(workflow, /export function AdminWorkflowSection/);
  assert.match(workflow, /<details/);
  assert.match(workflow, /<summary/);
  assert.match(workflow, /step/);
  assert.match(workflow, /tone/);
});

test("Admin V4 dashboard groups work queues instead of stretching five metrics across one row", () => {
  assert.match(dashboard, /md:grid-cols-2 2xl:grid-cols-3/);
  assert.doesNotMatch(dashboard, /xl:grid-cols-5/);
  assert.match(dashboard, /Catalogue à jour/);
  assert.match(dashboard, /CatalogHealthRow/);
  assert.doesNotMatch(dashboard, /Principe de travail/);
});

test("Admin V4 document review follows the A-D operational workflow", () => {
  assert.match(documents, /AdminWorkflowSection/);
  assert.match(documents, /step="A"[\s\S]*title="Fichier soumis"/);
  assert.match(documents, /step="B"[\s\S]*title="Message étudiant"/);
  assert.match(documents, /step="C"[\s\S]*title="Preuve de parcours"/);
  assert.match(documents, /step="D"[\s\S]*title="Décision documentaire"/);
  assert.match(documents, /Action sensible/);
  assert.match(documents, /Supprimer définitivement/);
});

test("Admin V4 document refactor preserves existing mutation boundaries", () => {
  assert.match(documents, /\/api\/admin\/documents\//);
  assert.match(documents, /saveEvidence/);
  assert.match(documents, /deleteDocument/);
  assert.match(documents, /reviewStatuses/);
});
