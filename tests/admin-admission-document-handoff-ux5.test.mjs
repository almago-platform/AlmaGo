import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(file, "utf8");
const page = read("src/app/admin/dossiers/[studentId]/page.tsx");
const shortcuts = read("src/components/admin/AdminDossierQuickHandoff.tsx");
const thread = read("src/components/product/DossierMessageThread.tsx");
const requirements = read("src/components/admin/AdminDocumentRequirementsPanel.tsx");
const adminMessage = read("src/app/api/admin/dossiers/[studentId]/messages/route.ts");
const studentMessages = read("src/app/student/messages/page.tsx");
const studentDocuments = read("src/app/student/documents/page.tsx");
const privateAttachment = read("src/app/api/dossier-messages/[messageId]/attachment/route.ts");

test("UX-5 starts from the real dossier with three direct links and no new records", () => {
  assert.match(page, /<AdminDossierQuickHandoff[\s\S]*?canExchange=\{Boolean\(profile\)\}/);
  assert.match(shortcuts, /Envoyer un PDF à l’étudiant/);
  assert.match(shortcuts, /Demander ses documents/);
  assert.match(shortcuts, /Suivre la candidature/);
  for (const anchor of ["#send-dossier-message", "#request-document", "#applications"]) {
    assert.ok(shortcuts.includes(anchor), anchor);
  }
  assert.match(shortcuts, /Fonction disponible après liaison du compte de la personne/);
  assert.match(shortcuts, /il ne valide pas à lui seul/);
  assert.doesNotMatch(shortcuts, /fetch\(|supabase|service_role/);
});

test("UX-5 opens the real private file composer even in a collapsed section", () => {
  assert.match(thread, /<form id="send-dossier-message" onSubmit=\{send\}/);
  assert.match(page, /targetIds=\{\["messages", "journal", "send-dossier-message"\]\}/);
  assert.match(thread, /application\/pdf/);
  assert.match(thread, /10 \* 1024 \* 1024/);
  assert.match(adminMessage, /getAdminUser/);
  assert.match(adminMessage, /if \(!isAdmin\)/);
  assert.match(adminMessage, /hasAllowedMessageAttachmentSignature\(file\)/);
  assert.match(adminMessage, /student_id: studentId/);
  assert.match(adminMessage, /sender_role: "admin"/);
  assert.match(privateAttachment, /getAuthenticatedUser/);
  assert.match(privateAttachment, /createSignedUrl/);
  assert.match(studentMessages, /viewerRole="student"/);
  assert.match(studentMessages, /from\("student_dossier_messages"\)/);
});

test("UX-5 documents are explicitly requested and sent using the existing student space", () => {
  assert.match(requirements, /id="request-document"/);
  assert.match(requirements, /requestDetailsRef\.current\.open = true/);
  assert.match(requirements, /window\.addEventListener\("hashchange", reveal\)/);
  assert.match(requirements, /Demander un document supplémentaire/);
  assert.match(requirements, /\/api\/admin\/dossiers\/\$\{studentId\}\/documents\/request/);
  assert.match(studentDocuments, /<DocumentsPanel/);
  assert.match(studentDocuments, /from\("student_document_requirements"\)/);
  assert.match(studentDocuments, /from\("documents"\)/);
  assert.match(page, /Enregistrement retiré des opérations/);
  assert.match(page, /Les mutations sensibles restent dans leurs écrans métier dédiés/);
});
