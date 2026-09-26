import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0016_germany_academic_evidence_persistence.sql",
  "utf8",
);

test("academic evidence is a dedicated model with contract values", () => {
  assert.match(migration, /create table public\.academic_evidence/);
  for (const value of [
    "definitive_admission", "conditional_admission", "bewerberbestaetigung",
    "admissible_university_correspondence", "student_declared",
    "admin_verified_fact", "official_document", "received", "needs_review",
    "accepted_for_pathway", "replace_required",
  ]) assert.match(migration, new RegExp(`'${value}'`), value);
});

test("document ownership is enforced by a composite foreign key", () => {
  assert.match(migration, /unique index documents_id_student_unique[\s\S]*?documents\(id, student_id\)/);
  assert.match(migration, /foreign key \(document_id, student_id\)[\s\S]*?references public\.documents\(id, student_id\)/);
});

test("students can read only their records and only Admin can manage classifications", () => {
  assert.match(migration, /alter table public\.academic_evidence enable row level security/);
  assert.match(migration, /for select to authenticated[\s\S]*?student_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /academic evidence admin manage[\s\S]*?for all to authenticated[\s\S]*?public\.is_admin\(\)/);
  assert.doesNotMatch(migration, /for (?:insert|update|delete)[\s\S]*?student_id = \(select auth\.uid\(\)\)/);
});

test("pathway acceptance fails closed at the database boundary", () => {
  for (const pattern of [
    /new\.origin <> 'official_document'/,
    /new\.document_id is null/,
    /new\.institution is null/,
    /new\.evidence_date is null/,
    /new\.evidence_date > current_date/,
    /new\.verified_at is null/,
    /new\.verified_at > now\(\)/,
    /linked_document\.status::text <> 'approved'/,
    /new\.verified_by <> auth\.uid\(\)/,
    /role = 'admin'/,
  ]) assert.match(migration, pattern);
});

test("withdrawn document approval invalidates accepted classification", () => {
  assert.match(migration, /documents_invalidate_academic_evidence/);
  assert.match(migration, /old\.status::text = 'approved' and new\.status::text <> 'approved'/);
  assert.match(migration, /verification_status = 'accepted_for_pathway'/);
  assert.match(migration, /set verification_status = case/);
});

test("the migration does not rewrite uploaded objects or existing document review statuses", () => {
  assert.doesNotMatch(migration, /storage\.objects|storage_path|original_filename|update public\.documents/);
  assert.doesNotMatch(migration, /alter type public\.document_status|drop type public\.document_status/);
});
