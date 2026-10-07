import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const panel = read("src/components/admin/AdminDocumentRequirementsPanel.tsx");
const smartDocuments = read("supabase/migrations/20261005174000_student_v2_smart_documents.sql");
const route = read("src/app/api/admin/dossiers/[studentId]/documents/requirements/[requirementId]/route.ts");
const dashboard = read("src/app/admin/page.tsx");
const people = read("src/app/admin/people/page.tsx");
const team = read("src/app/admin/team/page.tsx");

test("Admin V11 Dossier 360 loads document processing truth without creating a parallel document model", () => {
  for (const field of [
    "requires_tunisian_authentication",
    "requires_translation",
    "requires_german_legalisation",
    "legalisation_status",
    "legalisation_reason",
    "due_date",
    "deadline_kind",
    "deadline_cycle",
    "source_url",
    "source_verified_at",
    "admin_note",
  ]) {
    assert.ok(dossier.includes(field), field);
    assert.ok(panel.includes(field), field);
  }

  assert.match(dossier, /from\("student_document_requirements"\)/);
  assert.doesNotMatch(dossier, /from\("(document_operations|document_processing|legalisations)"\)/);
});

test("Admin V11 shows authentication translation and legalisation as internal document operations", () => {
  for (const label of [
    "Authentification requise",
    "Authentification en cours",
    "Authentification terminée",
    "Traduction requise",
    "Traduction en cours",
    "Traduction terminée",
    "Légalisation à vérifier",
    "Légalisation requise",
    "Légalisation non requise",
  ]) {
    assert.ok(panel.includes(label), label);
  }

  assert.match(panel, /ouvrir la source officielle/);
  assert.match(panel, /Note interne/);
  assert.match(panel, /requirementDeadlineLabel/);
  assert.match(panel, /Motif légalisation/);
});

test("Admin V11 never turns the default unknown legalisation seed into an automatic blocker", () => {
  assert.match(smartDocuments, /requires_german_legalisation,[\s\S]*legalisation_status/);
  assert.match(smartDocuments, /null,[\s\S]*'to_verify'/);

  assert.match(dossier, /requirement\.status === "legalisation_to_verify"/);
  assert.doesNotMatch(dossier, /requirement\.legalisation_status === "to_verify"/);
  assert.doesNotMatch(dossier, /requirement\.requires_german_legalisation === null/);
});

test("Admin V11 escalates only explicit internal document operations to Campus blockers", () => {
  assert.match(
    dossier,
    /\["authentication_required", "translation_required", "legalisation_required"\]\.includes\(requirement\.status\)/,
  );
  assert.match(dossier, /Authentification à lancer/);
  assert.match(dossier, /Traduction à lancer/);
  assert.match(dossier, /Légalisation à lancer/);
  assert.match(dossier, /Vérifier la règle/);
  assert.match(dossier, /Voir l’exigence/);
  assert.match(dossier, /owner: "almago"/);
});

test("Admin V11 keeps source provenance and procedure dates visibly typed", () => {
  assert.match(panel, /Deadline officielle/);
  assert.match(panel, /Date externe officielle/);
  assert.match(panel, /Cible interne/);
  assert.match(panel, /Revue de source/);
  assert.match(panel, /source_verified_at/);
  assert.match(panel, /deadline_cycle/);
});

test("Admin V11 document processing is actionable through an admin-only current-procedure API", () => {
  assert.match(route, /getAdminUser/);
  assert.match(route, /if \(!user\)/);
  assert.match(route, /if \(!isAdmin\)/);
  assert.match(route, /\.eq\("student_id", studentId\)/);
  assert.match(route, /\.eq\("is_current", true\)/);
  assert.match(route, /ancienne procédure/);
  assert.match(panel, /Mettre à jour le traitement interne/);
  assert.match(panel, /Enregistrer le traitement/);
});

test("Admin V11 legalisation mutation never infers a positive requirement from the default unknown state", () => {
  assert.match(route, /legalisation_to_verify/);
  assert.match(route, /requires_german_legalisation: null/);
  assert.match(route, /legalisation_status: "to_verify"/);
  assert.match(route, /legalisation_not_required/);
  assert.match(route, /requires_german_legalisation: false/);
  assert.match(route, /legalisation_status: "not_required"/);
  assert.match(route, /legalisation_required/);
  assert.match(route, /requires_german_legalisation: true/);
  assert.match(route, /Ajoutez le motif ou la source de la décision de légalisation/);
});

test("Admin V11 internal document writes rely on the existing audited requirement table", () => {
  assert.match(route, /from\("student_document_requirements"\)/);
  assert.match(route, /\.update\(update\)/);
  assert.doesNotMatch(route, /from\("(document_operations|document_processing|legalisations)"\)/);
  assert.match(panel, /Les changements sont enregistrés dans l’historique de la procédure/);
});

test("Admin V11 surfaces only current-procedure document replacements in operational queues", () => {
  for (const source of [dashboard, people, team]) {
    assert.match(source, /student_document_requirements/);
    assert.match(source, /student_procedures/);
    assert.match(source, /replacement_required/);
  }

  assert.match(dashboard, /replacementDocumentCaseIds/);
  assert.match(dashboard, /\/admin\/people\?work=document_replacement/);
  assert.match(dashboard, /Documents à remplacer/);

  assert.match(people, /document_replacement/);
  assert.match(people, /replacementDocuments/);
  assert.match(people, /À remplacer · \{person\.replacementDocuments\}/);

  assert.match(team, /replacementDocumentStudentIds/);
  assert.match(team, /\/admin\/people\?work=document_replacement/);
});

test("Admin V11 waiting-state queues include targeted current document requests without inventing student work", () => {
  for (const source of [dashboard, people, team]) {
    assert.match(source, /requirement\.requested_from_student/);
    assert.match(source, /\["requested", "replacement_required"\]\.includes\(requirement\.status\)/);
    assert.match(source, /requirement\.student_request_reason\?\.trim\(\)/);
  }
});
