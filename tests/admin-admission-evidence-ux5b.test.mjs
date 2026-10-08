import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const migration = read("supabase/migrations/20261008175900_admin_application_admission_evidence.sql");
const upload = read("src/app/api/admin/dossiers/[studentId]/admissions/route.ts");
const form = read("src/components/admin/AdminAdmissionPdfForm.tsx");
const admin = read("src/app/admin/dossiers/[studentId]/page.tsx");
const studentPage = read("src/app/student/applications/page.tsx");
const studentLetters = read("src/components/student/StudentApplicationLetters.tsx");
const studentPanel = read("src/components/student/StudentApplicationsPanel.tsx");
const studentDelete = read("src/app/api/student/documents/[id]/route.ts");
const prospectDelete = read("src/app/api/prospect/documents/[id]/route.ts");
const studentDocumentsPage = read("src/app/student/documents/page.tsx");
const studentDocumentsPanel = read("src/components/student/DocumentsPanel.tsx");

test("UX-5b: a university letter is bound to the same student's existing application and document", () => {
  assert.match(migration, /create unique index if not exists applications_id_student_unique/);
  assert.match(migration, /foreign key \(application_id, student_id\)[\s\S]*?references public\.applications \(id, student_id\)/);
  assert.match(migration, /on delete set null \(application_id\)/);
  assert.match(migration, /application_id is null[\s\S]*?evidence_type in \('definitive_admission', 'conditional_admission'\)/);
  assert.match(upload, /\.eq\("id", applicationId\)\.eq\("student_id", studentId\)/);
  assert.match(upload, /application_id: applicationId/);
  assert.match(upload, /document_id: documentId/);
  assert.match(upload, /from\("academic_evidence"\)/);
});

test("UX-5b: only MFA-protected admins may upload private PDF without asserting admission", () => {
  assert.match(upload, /getAdminUser/);
  assert.match(upload, /if \(!user\)/);
  assert.match(upload, /if \(!isAdmin\)/);
  assert.match(upload, /hasAllowedDocumentSignature\(file\)/);
  assert.match(upload, /file\.type !== "application\/pdf"/);
  assert.match(upload, /file\.size > maxDocumentBytes/);
  assert.match(upload, /studentId}\/admissions\/\$\{documentId}/);
  assert.match(upload, /upsert: false/);
  assert.match(upload, /category: "admission"/);
  assert.match(upload, /status: "pending"/);
  assert.match(upload, /verification_status: "needs_review"/);
  assert.match(upload, /student_history/);
  assert.match(upload, /removeDocument\(\)/);
  assert.match(upload, /removeFile\(\)/);
  assert.doesNotMatch(upload, /service_role|SUPABASE_SERVICE_ROLE|\.from\("applications"\)\.update\(/);
  assert.match(migration, /documents admin admission insert/);
  assert.match(migration, /and uploaded_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /and category = 'admission'/);
  assert.match(migration, /and mime_type = 'application\/pdf'/);
  assert.match(migration, /document objects admin admission upload/);
  assert.equal((migration.match(/\(select auth\.jwt\(\) ->> 'aal'\) = 'aal2'/g) || []).length, 3);
  assert.match(migration, /bucket_id = 'student-documents'/);
});

test("UX-5b: students cannot delete a Campus-uploaded pending admission document", () => {
  assert.match(migration, /student_id = \(select auth\.uid\(\)\)[\s\S]*?and uploaded_by = \(select auth\.uid\(\)\)/);
  assert.match(migration, /create or replace function public\.can_delete_own_document_object/);
  assert.match(migration, /and uploaded_by = \(select auth\.uid\(\)\)/);
  assert.match(studentDelete, /document\.uploaded_by !== user\.id/);
  assert.match(prospectDelete, /document\.uploaded_by !== user\.id/);
  assert.match(studentDocumentsPage, /currentUserId=\{user\.id\}/);
  assert.match(studentDocumentsPanel, /document\.uploaded_by === currentUserId/);
});

test("UX-5b: the admin has a short evidence form and the student sees PDFs on their own application", () => {
  assert.match(form, /Ajouter une lettre universitaire \(PDF\)/);
  assert.match(form, /application_id/);
  assert.match(form, /evidence_type/);
  assert.match(form, /institution/);
  assert.match(form, /fetch\(`\/api\/admin\/dossiers\/\$\{studentId\}\/admissions`/);
  assert.match(form, /Vérification humaine encore nécessaire/);
  assert.match(admin, /<AdminAdmissionPdfForm/);
  assert.match(studentPage, /\.from\("academic_evidence"\)/);
  assert.match(studentPage, /\.in\("application_id", applications\.map\(\(application\) => application\.id\)\)/);
  assert.match(studentPanel, /<StudentApplicationLetters/);
  assert.match(studentLetters, /letter\.application_id === applicationId/);
  assert.match(studentLetters, /letter\.verification_status === "accepted_for_pathway"/);
  assert.match(studentLetters, /\/api\/documents\/\$\{letter\.document_id\}\/view/);
  assert.match(studentLetters, /does not automatically change the application status/);
});
