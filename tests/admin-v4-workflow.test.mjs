import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");
const workflow = read("src/components/admin/AdminWorkflowSection.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const prospects = read("src/app/admin/prospects/page.tsx");

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


test("Admin V4 applications follow the shared A-D operational workflow", () => {
  assert.match(applications, /AdminWorkflowSection/);
  assert.match(applications, /step="A"[\s\S]*title="Candidature enregistrée"/);
  assert.match(applications, /step="B"[\s\S]*title="Suivi et historique"/);
  assert.match(applications, /step="C"[\s\S]*title="Mise à jour étudiant"/);
  assert.match(applications, /step="D"[\s\S]*title="Décision et enregistrement"/);
  assert.match(applications, /allowedApplicationTransitions/);
  assert.match(applications, /transitionRequirements/);
});

test("Admin V4 prospects use the same A-D reading order without automating qualification", () => {
  assert.match(prospects, /AdminWorkflowSection/);
  assert.match(prospects, /step="A"[\s\S]*title="Projet étudiant"/);
  assert.match(prospects, /step="B"[\s\S]*title="Demande et contact"/);
  assert.match(prospects, /step="C"[\s\S]*title="Orientation et qualification"/);
  assert.match(prospects, /step="D"[\s\S]*title="Décision de qualification"/);
  assert.match(prospects, /ProspectQualificationReviewForm/);
  assert.doesNotMatch(prospects, /\.update\(|\.insert\(/);
});
