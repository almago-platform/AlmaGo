import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const migration = read("supabase/migrations/0051_campus_allemagne_smart_documents.sql");
const uploadRoute = read("src/app/api/student/documents/upload/route.ts");
const documentsPage = read("src/app/student/documents/page.tsx");
const documentsPanel = read("src/components/student/DocumentsPanel.tsx");

test("P3 seeds exactly the approved starter-document policy", () => {
  for (const [key, category] of [
    ["passport", "passport"],
    ["baccalaureate", "baccalaureate"],
    ["baccalaureate_transcript", "transcripts"],
  ]) {
    const index = migration.indexOf(`'${key}'`);
    assert.notEqual(index, -1, key);
    const fragment = migration.slice(index, index + 700);
    assert.match(fragment, new RegExp(`'${category}'`), key);
    assert.match(fragment, /true,[\s\S]+?indispensable/i, key);
  }

  const languageIndex = migration.indexOf("'existing_language_certificate'");
  assert.notEqual(languageIndex, -1);
  const languageFragment = migration.slice(languageIndex, languageIndex + 650);
  assert.match(languageFragment, /'language_certificate'/);
  assert.match(languageFragment, /'not_applicable'/);
  assert.match(languageFragment, /false,[\s\S]+?null/i);

  assert.doesNotMatch(
    migration.slice(0, migration.indexOf("create or replace function public.admin_request_student_document")),
    /bachelor_or_licence_diploma|university_transcripts|grading_system|diploma_supplement/i,
  );
});

test("P3 exceptional student document requests require an explicit reason", () => {
  assert.match(migration, /create or replace function public\.admin_request_student_document/i);
  assert.match(migration, /if not public\.is_admin\(\) then/i);
  assert.match(migration, /normalized_reason text := btrim\(coalesce\(p_reason, ''\)\)/i);
  assert.match(migration, /requirement_key_label_and_reason_required/i);
  assert.match(migration, /requested_from_student,[\s\S]+student_request_reason/i);
  assert.match(migration, /true,[\s\S]+normalized_reason/i);
  assert.match(migration, /starter_requirement_is_managed_automatically/i);
});

test("P3 reuses documents and keeps requirement lifecycle synchronized", () => {
  assert.match(migration, /private\.campus_requirement_status_for_document/i);
  assert.match(migration, /when 'approved' then 'accepted_original'/i);
  assert.match(migration, /when 'replace_required' then 'replacement_required'/i);
  assert.match(migration, /when 'rejected' then 'replacement_required'/i);
  assert.match(migration, /documents_sync_campus_requirement/i);
  assert.match(migration, /documents_reset_campus_requirement_before_delete/i);
  assert.match(migration, /before delete on public\.documents/i);
  assert.match(migration, /document_id = null/i);
});

test("P3 automatically seeds requirements for new and already-current procedures", () => {
  assert.match(migration, /student_procedures_seed_starter_requirements/i);
  assert.match(migration, /after insert on public\.student_procedures/i);
  assert.match(
    migration,
    /select private\.seed_campus_starter_requirements\(id\)[\s\S]+from public\.student_procedures[\s\S]+where is_current/i,
  );
});

test("student upload API enforces active Campus Allemagne requirements without breaking legacy students", () => {
  assert.match(uploadRoute, /from\("student_procedures"\)/);
  assert.match(uploadRoute, /eq\("is_current", true\)/);
  assert.match(uploadRoute, /from\("student_document_requirements"\)/);
  assert.match(uploadRoute, /requirement\.requested_from_student/i);
  assert.match(uploadRoute, /existing_language_certificate/i);
  assert.match(uploadRoute, /\["requested", "replacement_required"\]/);
  assert.match(uploadRoute, /Cette pièce n’est pas demandée pour votre dossier actuellement/);

  const guardStart = uploadRoute.indexOf("if (currentProcedure)");
  assert.ok(guardStart > -1);
  assert.doesNotMatch(uploadRoute.slice(0, guardStart), /student_document_requirements/);
});

test("student document UI exposes only currently uploadable requirement categories", () => {
  assert.match(documentsPage, /allowedUploadCategories/i);
  assert.match(documentsPage, /student_document_requirements/i);
  assert.match(documentsPage, /existing_language_certificate/i);
  assert.match(documentsPanel, /allowedUploadCategories\?: string\[\]/);
  assert.match(documentsPanel, /documentCategories\.filter/);
  assert.match(documentsPanel, /uploadCategories\.map/);
  assert.match(documentsPanel, /uploadCategories\.length > 0/);
});
