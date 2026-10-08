import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const summary = read("src/components/admin/AdminDossierQuickHandoff.tsx");
const admissionForm = read("src/components/admin/AdminAdmissionPdfForm.tsx");
const academicAssessment = read("src/lib/academic-evidence.ts");

test("UX-5c is a read-only one-screen follow-up of the same person, not a second workflow", () => {
  assert.match(dossier, /<AdminDossierQuickHandoff[\s\S]*?admission=\{admissionFollowUp\}/);
  assert.match(dossier, /requestedDocuments=\{studentDocumentRequests\.map\(\(item\) => item\.label\)\}/);
  assert.match(dossier, /documentsToReview=\{documentsAwaitingDecision\.length\}/);
  assert.match(dossier, /unreadStudentMessages=\{unreadStudentMessages\}/);
  for (const title of [
    "Admission universitaire",
    "Documents demandés",
    "Messages de l’étudiant",
    "Deadline universitaire",
  ]) assert.ok(summary.includes(title), title);
  for (const href of [
    "#applications",
    "#admission-pdf",
    "#documents",
    "#request-document",
    "#messages",
    "#send-dossier-message",
  ]) assert.ok(summary.includes(href), href);
  assert.doesNotMatch(summary, /fetch\(|\.from\(|supabase|service_role|\.insert\(|\.update\(/);
});

test("UX-5c only calls admitted evidence verified with official approved documented proof", () => {
  assert.match(dossier, /\.from\("academic_evidence"\)/);
  assert.match(dossier, /\.eq\("student_id", studentId\)/);
  assert.match(dossier, /\.not\("application_id", "is", null\)/);
  assert.match(dossier, /const applicationIds = new Set\(applications\.map/);
  assert.match(dossier, /applicationIds\.has\(item\.application_id\)/);
  assert.match(dossier, /assessAcademicEvidence\(\{/);
  assert.match(dossier, /document_status: item\.document_id \? documentStatusById\.get/);
  assert.match(dossier, /result\.status === "accepted"/);
  assert.match(dossier, /available: !linkedEvidenceResult\.error/);
  assert.match(academicAssessment, /evidence\.document_status !== "approved"/);
  assert.match(academicAssessment, /evidence\.verification_status !== "accepted_for_pathway"/);
  assert.match(summary, /Preuves d’admission momentanément indisponibles/);
  assert.match(summary, /il ne valide pas à lui seul/);
});

test("UX-5c waits for recorded student requests, messages and verified university deadlines", () => {
  assert.match(dossier, /item\.requested_from_student && \(item\.status === "requested" \|\| item\.status === "replacement_required"\)/);
  assert.match(dossier, /item\.sender_role === "student" && !item\.admin_read_at/);
  assert.match(dossier, /application\.deadline_kind === "official_hard_deadline"/);
  assert.match(dossier, /applicationDateIsTrusted\(application\)/);
  assert.match(dossier, /!isSubmittedApplicationStatus\(application\.status\)/);
  assert.match(summary, /Aucune deadline officielle vérifiée pour une candidature active non soumise/);
  assert.match(summary, /Aucun message non lu dans les échanges chargés/);
  assert.match(summary, /Les dates de tâches internes ne sont jamais présentées comme des deadlines universitaires/);
});

test("UX-5c retains multiple distinct admission PDFs and opens the correct existing form", () => {
  assert.match(dossier, /item\.category !== "admission"/);
  assert.match(dossier, /documents\.filter\(\(item\) => item\.category === "admission"\)/);
  assert.match(admissionForm, /id="admission-pdf" ref=\{detailsRef\}/);
  assert.match(admissionForm, /window\.addEventListener\("hashchange", reveal\)/);
  assert.match(admissionForm, /detailsRef\.current\.open = true/);
  assert.match(admissionForm, /document\.addEventListener\("click", handleLink\)/);
});
