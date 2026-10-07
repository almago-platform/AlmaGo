import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const requirementsPanel = read("src/components/admin/AdminDocumentRequirementsPanel.tsx");
const requestRoute = read("src/app/api/admin/dossiers/[studentId]/documents/request/route.ts");

test("Admin V11 dossier 360 reads current smart document requirements", () => {
  assert.match(dossier, /from\("student_procedures"\)/);
  assert.match(dossier, /eq\("is_current", true\)/);
  assert.match(dossier, /from\("student_document_requirements"\)/);
  assert.match(dossier, /AdminDocumentRequirementsPanel/);
  assert.match(dossier, /documentRequirements/);
});

test("Admin V11 can request a targeted student document without a second file store", () => {
  assert.match(requestRoute, /getAdminUser/);
  assert.match(requestRoute, /admin_request_student_document/);
  assert.match(requestRoute, /p_student_id: studentId/);
  assert.match(requestRoute, /p_reason: reason/);
  assert.match(requestRoute, /p_due_date: dueDate \|\| null/);
  assert.doesNotMatch(requestRoute, /from\("documents"\)\.insert/);
});

test("Admin V11 document requests are tied into contact continuity and notifications", () => {
  assert.match(requestRoute, /from\("student_case_notes"\)\.insert/);
  assert.match(requestRoute, /kind: "document_request"/);
  assert.match(requestRoute, /admin_enqueue_campus_notifications/);
  assert.match(requestRoute, /warning/);
});

test("Admin V11 document requirements distinguish request truth from uploaded files", () => {
  for (const label of [
    "Ce qui est demandé, reçu et validé",
    "Demandés",
    "À vérifier",
    "À remplacer",
    "Validés",
    "Demander un document supplémentaire",
    "Message visible par l’étudiant",
  ]) {
    assert.ok(requirementsPanel.includes(label), label);
  }
  assert.match(requirementsPanel, /document_id/);
  assert.match(requirementsPanel, /Aucun fichier lié pour le moment/);
  assert.match(requirementsPanel, /En attente de l’étudiant/);
});

test("Admin V11 dossier keeps prior document versions visible", () => {
  assert.match(dossier, /documentVersionById/);
  assert.match(dossier, /Version \$\{documentVersionById\.get\(document\.id\) \|\| 1\}/);
  assert.match(dossier, /Tous les fichiers enregistrés/);
});

test("Admin V11 dossier priority ignores procedure-generated system steps", () => {
  assert.match(dossier, /isOpenAdminAction\(item\.status\) && item\.template_id === null/);
});

test("Admin V11 document queue shows only the latest version per student and category", () => {
  const page = read("src/app/admin/documents/page.tsx");
  assert.match(page, /latestByStudentCategory/);
  assert.match(page, /student_id}:\$\{document\.category/);
  assert.match(page, /Versions actuelles|version actuelle/);
});

test("Admin V11 separates staff decisions from documents waiting on the student", () => {
  const dashboard = read("src/app/admin/page.tsx");
  const people = read("src/app/admin/people/page.tsx");
  const documents = read("src/components/admin/AdminDocumentsPanel.tsx");

  assert.match(dashboard, /\["pending", "reviewed"\]/);
  assert.match(people, /attentionDocumentStatuses = new Set\(\["pending", "reviewed"\]\)/);
  assert.match(documents, /needsDecision/);
  assert.match(documents, /waitingStudentCount/);
  assert.match(documents, /attend.*l’étudiant/);
});
