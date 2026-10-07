import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const panel = read("src/components/admin/AdminDocumentRequirementsPanel.tsx");
const smartDocuments = read("supabase/migrations/20261005174000_student_v2_smart_documents.sql");

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
