import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dashboard = read("src/app/admin/page.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");
const workflow = read("src/components/admin/AdminWorkflowSection.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const prospects = read("src/app/admin/prospects/page.tsx");
const offers = read("src/components/admin/CommercialOfferEditor.tsx");
const programs = read("src/components/admin/AdminProgramsPanel.tsx");
const universities = read("src/components/admin/AdminUniversitiesPanel.tsx");
const language = read("src/components/admin/AdminLanguageCoursesPanel.tsx");
const finance = read("src/components/admin/AdminFinanceInsurancePanel.tsx");
const catalogueSummary = read("src/components/admin/AdminWorkspaceSummary.tsx");

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


test("Admin V4 catalogue pages share one compact operational summary", () => {
  assert.match(catalogueSummary, /export function AdminWorkspaceSummary/);
  assert.match(catalogueSummary, /metrics/);
  assert.match(catalogueSummary, /eyebrow/);
});

test("Admin V4 commercial offers follow the same A-D publication workflow", () => {
  assert.match(offers, /AdminWorkflowSection/);
  assert.match(offers, /step="A"[\s\S]*title="Présentation de l’offre"/);
  assert.match(offers, /step="B"[\s\S]*title="Services inclus"/);
  assert.match(offers, /step="C"[\s\S]*title="Prix et devise"/);
  assert.match(offers, /step="D"[\s\S]*title="Version et publication"/);
  assert.match(offers, /submit\("draft"\)/);
  assert.match(offers, /submit\("publish"\)/);
});

test("Admin V4 university and programme editors use the shared workflow primitive", () => {
  assert.match(universities, /AdminWorkflowSection/);
  assert.match(universities, /step="A"[\s\S]*title="Identité et localisation"/);
  assert.match(universities, /step="D"[\s\S]*title="Description et informations financières"/);
  assert.match(programs, /AdminWorkflowSection/);
  assert.match(programs, /step="A"[\s\S]*title="Identité du programme"/);
  assert.match(programs, /step="F"[\s\S]*title="Maintenance interne"/);
});

test("Admin V4 sourced catalogues separate facts, verification and publication", () => {
  for (const source of [language, finance]) {
    assert.match(source, /AdminWorkflowSection/);
    assert.match(source, /step="C"[\s\S]*title="Source et vérification"/);
    assert.match(source, /step="D"[\s\S]*title="Publication"/);
    assert.match(source, /Publier dans l’espace étudiant/);
  }
});


test("Admin V4 dashboard work queues are anchored in one consolidated panel", () => {
  assert.match(dashboard, /File opérationnelle consolidée/);
  assert.match(dashboard, /AdminQueueRow/);
  assert.match(dashboard, /divide-y divide-\[var\(--border\)\]/);
  assert.doesNotMatch(dashboard, /function AdminSummaryCard/);
  assert.doesNotMatch(dashboard, /mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3/);
});
