import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/20261007143000_dossier_message_attachments.sql");
const shared = read("src/lib/dossier-message-attachments.ts");
const thread = read("src/components/product/DossierMessageThread.tsx");
const studentPage = read("src/app/student/messages/page.tsx");
const studentRoute = read("src/app/api/student/messages/route.ts");
const prospectPage = read("src/app/prospect/messages/page.tsx");
const prospectRoute = read("src/app/api/prospect/messages/route.ts");
const adminRoute = read("src/app/api/admin/dossiers/[studentId]/messages/route.ts");
const attachmentRoute = read("src/app/api/dossier-messages/[messageId]/attachment/route.ts");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const appShell = read("src/components/layout/AppShell.tsx");
const prospectShell = read("src/components/layout/ProspectShell.tsx");

test("Messaging V2 stores one private attachment on the existing shared dossier message", () => {
  for (const field of [
    "attachment_storage_path",
    "attachment_name",
    "attachment_mime_type",
    "attachment_size_bytes",
  ]) {
    assert.ok(migration.includes(field), field);
  }

  assert.match(migration, /dossier-message-attachments/);
  assert.match(migration, /public, file_size_limit, allowed_mime_types/);
  assert.match(migration, /false,[\s\S]*10485760/);
  assert.match(migration, /application\/pdf/);
  assert.match(migration, /image\/jpeg/);
  assert.match(migration, /image\/png/);
  assert.doesNotMatch(migration, /create table .*message_attachments/i);
});

test("Messaging V2 protects attachment storage for the participant folder and admins only", () => {
  assert.match(migration, /message attachments own read/);
  assert.match(migration, /message attachments admin read/);
  assert.match(migration, /message attachments own upload/);
  assert.match(migration, /message attachments admin upload/);
  assert.match(migration, /message attachments own delete/);
  assert.match(migration, /message attachments admin delete/);
  assert.match(migration, /storage\.foldername\(name\)\)\[1\] = auth\.uid\(\)::text/);
  assert.match(migration, /public\.is_admin\(\)/);
  assert.match(migration, /invalid_message_attachment_path/);
});

test("Messaging V2 accepts a file-only message but rejects an empty message without attachment", () => {
  assert.match(migration, /char_length\(btrim\(body\)\) between 2 and 4000[\s\S]*or attachment_storage_path is not null/);
  assert.match(thread, /draft\.trim\(\)\.length < 2 && !attachment/);
  assert.match(studentRoute, /message\.length < 2 && !file/);
  assert.match(prospectRoute, /message\.length < 2 && !file/);
  assert.match(adminRoute, /message\.length < 2 && !file/);
});

test("Messaging V2 validates attachment size type extension and signature server-side", () => {
  assert.match(shared, /isSafeDocumentFile/);
  assert.match(shared, /hasAllowedDocumentSignature/);
  assert.match(studentRoute, /isSafeMessageAttachment/);
  assert.match(studentRoute, /hasAllowedMessageAttachmentSignature/);
  assert.match(prospectRoute, /isSafeMessageAttachment/);
  assert.match(prospectRoute, /hasAllowedMessageAttachmentSignature/);
  assert.match(adminRoute, /isSafeMessageAttachment/);
  assert.match(adminRoute, /hasAllowedMessageAttachmentSignature/);
});

test("Messaging V2 uses multipart FormData and keeps one file per message in the UI", () => {
  assert.match(thread, /new FormData\(\)/);
  assert.match(thread, /formData\.set\("file", attachment\)/);
  assert.match(thread, /type="file"/);
  assert.match(thread, /application\/pdf,image\/jpeg,image\/png/);
  assert.match(thread, /10 MiB maximum · 1 fichier par message/);
  assert.match(thread, /Document joint/);
  assert.match(thread, /Image jointe/);
  assert.match(thread, /\/api\/dossier-messages\/\$\{item\.id\}\/attachment/);
});

test("Messaging V2 opens attachments only through an authenticated signed-url boundary", () => {
  assert.match(attachmentRoute, /getAuthenticatedUser/);
  assert.match(attachmentRoute, /if \(!user\)/);
  assert.match(attachmentRoute, /from\("student_dossier_messages"\)/);
  assert.match(attachmentRoute, /select\("attachment_storage_path"\)/);
  assert.match(attachmentRoute, /createSignedUrl/);
  assert.match(attachmentRoute, /messageAttachmentBucket/);
});

test("Candidate/prospect messaging reuses the same conversation and is available only outside client access", () => {
  assert.match(prospectPage, /Messages avec Campus Allemagne/);
  assert.match(prospectPage, /endpoint="\/api\/prospect\/messages"/);
  assert.match(prospectPage, /from\("student_dossier_messages"\)/);
  assert.match(prospectRoute, /getPhase2StudentAccess/);
  assert.match(prospectRoute, /access\.phase2Enabled && !access\.canUseClientFeatures/);
  assert.match(prospectRoute, /sender_role: "student"/);
  assert.match(prospectRoute, /from\("student_dossier_messages"\)/);
  assert.doesNotMatch(prospectRoute, /from\("documents"\)/);
});

test("Student and admin messaging both support attachments in the same thread", () => {
  for (const source of [studentPage, dossier]) {
    assert.match(source, /attachment_name,attachment_mime_type,attachment_size_bytes/);
  }

  for (const source of [studentRoute, prospectRoute, adminRoute]) {
    assert.match(source, /attachment_storage_path/);
    assert.match(source, /attachment_name/);
    assert.match(source, /attachment_mime_type/);
    assert.match(source, /attachment_size_bytes/);
    assert.match(source, /messageAttachmentStoragePath/);
  }

  assert.match(dossier, /Messages avec le candidat/);
  assert.match(dossier, /Messages avec l’étudiant/);
  assert.match(dossier, /participantLabel=/);
});

test("Student and prospect navigation expose a dedicated messages surface", () => {
  assert.match(appShell, /href: "\/student\/messages"/);
  assert.match(appShell, /Écrire à Campus Allemagne/);
  assert.match(prospectShell, /href: "\/prospect\/messages"/);
  assert.match(prospectShell, /messageNavCopy/);
});

test("Messaging attachments remain conversation artefacts, not automatic dossier documents", () => {
  assert.match(studentPage, /ne remplacent pas automatiquement les documents demandés/);
  assert.match(prospectPage, /ne remplacent pas automatiquement les documents demandés/);
  assert.match(dossier, /ne remplacent pas automatiquement les documents officiels du dossier/);
  assert.doesNotMatch(studentRoute, /from\("documents"\)/);
  assert.doesNotMatch(adminRoute, /from\("documents"\)/);
  assert.doesNotMatch(prospectRoute, /from\("documents"\)/);
});

test("Messaging V2 notifications are neutral for candidates and students and mention attachments", () => {
  assert.match(migration, /Un candidat ou étudiant vous a envoyé un message avec une pièce jointe/);
  assert.match(migration, /Un candidat ou étudiant vous a répondu dans son dossier/);
  assert.match(migration, /has_attachment/);
  assert.match(migration, /Nouveau message Campus Allemagne/);
});
