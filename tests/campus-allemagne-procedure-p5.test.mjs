import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const cockpit = read("src/app/admin/students/[studentId]/procedure/page.tsx");
const applications = read("src/components/admin/AdminApplicationsPanel.tsx");
const documents = read("src/components/admin/AdminDocumentsPanel.tsx");

test("P5 cockpit consolidates existing Campus Allemagne operational truth", () => {
  for (const table of [
    "profiles",
    "student_projects",
    "student_procedures",
    "student_document_requirements",
    "student_checklist_items",
    "applications",
    "student_history",
  ]) {
    assert.match(cockpit, new RegExp(`from\\("${table}"\\)`), table);
  }

  assert.doesNotMatch(cockpit, /createClientComponent|service_role|SUPABASE_SECRET/i);
});

test("P5 distinguishes student actions from Campus Allemagne and external work", () => {
  assert.match(cockpit, /requested_from_student/);
  assert.match(cockpit, /student_request_reason/);
  assert.match(cockpit, /requires_student_action/);
  assert.match(cockpit, /student_action_reason/);
  assert.match(cockpit, /owner === "almago"/);
  assert.match(cockpit, /owner === "external"/);
  assert.match(cockpit, /Aucune action requise actuellement/);
});

test("P5 keeps verified official deadlines separate from Campus Allemagne internal targets", () => {
  assert.match(cockpit, /evaluateCampusApplicationDeadline/);
  assert.match(cockpit, /buildCampusInternalTargets/);
  assert.match(cockpit, /Officielle vérifiée/);
  assert.match(cockpit, /À vérifier/);
  assert.match(cockpit, /Campus Allemagne ·/);
  assert.match(cockpit, /Aucun objectif interne n’est calculé tant que la deadline officielle n’est pas vérifiée/);
});

test("P5 surfaces document legalisation truth without assuming it by default", () => {
  assert.match(cockpit, /requires_german_legalisation/);
  assert.match(cockpit, /legalisation_status/);
  assert.match(cockpit, /non requise \/ à confirmer/);
});

test("P5 exposes audit history and specialist admin queues instead of duplicating mutation flows", () => {
  assert.match(cockpit, /student_history/);
  assert.match(cockpit, /Historique dossier/);
  assert.match(cockpit, /href="\/admin\/documents"/);
  assert.match(cockpit, /href="\/admin\/applications"/);
  assert.doesNotMatch(cockpit, /fetch\(|method="POST"|method="PATCH"/i);
});

test("existing admin queues link directly to the student procedure cockpit", () => {
  assert.match(applications, /\/admin\/students\/\$\{application\.student_id\}\/procedure/);
  assert.match(documents, /\/admin\/students\/\$\{document\.student_id\}\/procedure/);
  assert.match(applications, /Ouvrir le dossier Campus Allemagne/);
  assert.match(documents, /Ouvrir le dossier Campus Allemagne/);
});
