import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const page = read("src/app/student/procedure/page.tsx");
const header = read("src/components/student/StudentJourneyHeader.tsx");
const shared = read("src/content/student-shared-copy.ts");

test("P6 gives the student one simplified live dossier view", () => {
  for (const table of [
    "student_procedures",
    "student_document_requirements",
    "student_checklist_items",
    "applications",
  ]) {
    assert.match(page, new RegExp(`from\\("${table}"\\)`), table);
  }
  assert.match(page, /Votre dossier Allemagne/);
  assert.match(page, /Aucune action requise pour le moment/);
  assert.match(page, /Ce que Campus Allemagne fait maintenant/);
});

test("P6 only surfaces explicit student actions with reasons", () => {
  assert.match(page, /requested_from_student/);
  assert.match(page, /student_request_reason/);
  assert.match(page, /requires_student_action/);
  assert.match(page, /student_action_reason/);
  assert.match(page, /item\.requested_from_student && \["requested", "replacement_required"\]/);
});

test("P6 preserves starter document policy and optional language certificate", () => {
  for (const key of [
    "passport",
    "baccalaureate",
    "baccalaureate_transcript",
    "existing_language_certificate",
  ]) assert.match(page, new RegExp(key));
  assert.match(page, /3 pièces demandées par défaut/);
  assert.match(page, /Facultatif s’il existe/);
});

test("P6 keeps official deadlines distinct from internal Campus targets", () => {
  assert.match(page, /evaluateCampusApplicationDeadline/);
  assert.match(page, /buildCampusInternalTargets/);
  assert.match(page, /Prochaine deadline officielle/);
  assert.match(page, /Prochain objectif Campus Allemagne/);
  assert.match(page, /Campus Allemagne ·/);
});

test("P6 is part of the existing student journey and localized navigation", () => {
  assert.match(header, /"procedure"/);
  assert.match(header, /\/student\/procedure/);
  assert.match(shared, /"Mon dossier"/);
  assert.match(shared, /"ملفي"/);
  assert.match(shared, /"My file"/);
  assert.match(shared, /"Meine Akte"/);
});
