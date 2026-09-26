import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const studentPage = readFileSync("src/app/student/documents/page.tsx", "utf8");
const studentPanel = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const adminPage = readFileSync("src/app/admin/documents/page.tsx", "utf8");
const adminPanel = readFileSync("src/components/admin/AdminDocumentsPanel.tsx", "utf8");

test("Student documents page loads own academic evidence through the existing RLS-scoped client", () => {
  assert.match(studentPage, /from\("academic_evidence"\)/);
  assert.match(studentPage, /toStudentAcademicEvidenceView/);
  assert.match(studentPage, /document_status:/);
  assert.doesNotMatch(studentPage, /service[_-]?role|createAdminClient/i);
});

test("Student UI separates document review from academic pathway evidence", () => {
  assert.match(studentPanel, /Le statut d’un fichier et son statut comme preuve académique sont deux choses différentes/);
  assert.match(studentPanel, /Un document peut être approuvé sans être encore accepté comme preuve de parcours/);
  assert.match(studentPanel, /ne constitue ni une admission ni une décision de visa/);
  assert.match(studentPanel, /Acceptée comme preuve de parcours/);
  assert.match(studentPanel, /À vérifier/);
  assert.match(studentPanel, /À remplacer/);
});

test("Student evidence copy stays factual and exposes no Admin ownership fields", () => {
  assert.match(studentPanel, /item\.assessment\.reason/);
  assert.match(studentPanel, /item\.institution \|\| "À confirmer"/);
  assert.doesNotMatch(studentPanel, /verified_by|student_id|admin_notes/i);
  assert.doesNotMatch(
    studentPanel,
    /visa garanti|éligible au visa|chance d['’]admission|probabilit[ée] d['’]admission/i,
  );
});

test("Admin page loads document ownership plus evidence and includes approved files for evidence classification", () => {
  assert.match(adminPage, /id,student_id,category/);
  assert.match(adminPage, /from\("academic_evidence"\)/);
  assert.match(adminPage, /toAdminAcademicEvidenceView/);
  assert.match(adminPage, /\["pending", "replace_required", "approved"\]/);
});

test("Admin workflow keeps document approval and pathway evidence acceptance distinct", () => {
  assert.match(adminPanel, /L’approbation du fichier et son acceptation comme preuve de parcours sont deux décisions distinctes/);
  assert.match(adminPanel, /Accepter comme preuve de parcours/);
  assert.match(adminPanel, /Le fichier doit d’abord être approuvé/);
  assert.match(adminPanel, /document\.status !== "approved"/);
  assert.match(adminPanel, /verification_status: verificationStatus/);
});

test("Admin evidence acceptance and replacement require explicit confirmation", () => {
  assert.match(adminPanel, /window\.confirm\("Confirmer que ce document approuvé doit être accepté comme preuve académique de parcours/);
  assert.match(adminPanel, /window\.confirm\("Confirmer que cette classification académique doit être marquée comme preuve à remplacer/);
});

test("Admin evidence write uses only the bounded backend contract and connected student/document context", () => {
  assert.match(adminPanel, /fetch\("\/api\/admin\/academic-evidence"/);
  assert.match(adminPanel, /student_id: document\.student_id/);
  assert.match(adminPanel, /origin: "official_document"/);
  assert.match(adminPanel, /document_id: document\.id/);
  assert.doesNotMatch(adminPanel, /verified_by|verified_at:/);
});

test("evidence load failures do not block ordinary document review surfaces", () => {
  assert.match(studentPanel, /Les classifications académiques sont temporairement indisponibles/);
  assert.match(adminPanel, /Les classifications académiques sont temporairement indisponibles/);
  assert.match(adminPanel, /La revue des fichiers reste accessible/);
});
