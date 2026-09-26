import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  academicEvidenceOrigins,
  academicEvidenceTypes,
  academicEvidenceVerificationStatuses,
} from "../src/lib/academic-evidence.ts";

const migration = readFileSync(
  "supabase/migrations/0016_germany_academic_evidence_persistence.sql",
  "utf8",
);

function checkValuesForColumn(columnName) {
  const pattern = new RegExp(`${columnName} text not null[\\s\\S]*?check \\(${columnName} in \\(([\\s\\S]*?)\\)\\)`);
  const match = migration.match(pattern);
  assert.ok(match, `expected a check constraint for ${columnName}`);
  return match[1]
    .split(",")
    .map((value) => value.trim().replace(/^'|'$/g, ""))
    .filter(Boolean);
}

test("academic evidence is a dedicated model with contract values", () => {
  assert.match(migration, /create table public\.academic_evidence/);
  for (const value of [
    "definitive_admission", "conditional_admission", "bewerberbestaetigung",
    "admissible_university_correspondence", "student_declared",
    "admin_verified_fact", "official_document", "received", "needs_review",
    "accepted_for_pathway", "replace_required",
  ]) assert.match(migration, new RegExp(`'${value}'`), value);
});

test("evidence_type, origin and verification_status enums stay in lockstep between the TS contract and the SQL source", () => {
  assert.deepEqual(checkValuesForColumn("evidence_type"), [...academicEvidenceTypes]);
  assert.deepEqual(checkValuesForColumn("origin"), [...academicEvidenceOrigins]);
  assert.deepEqual(
    checkValuesForColumn("verification_status"),
    [...academicEvidenceVerificationStatuses],
  );
});

test("document ownership is enforced by a composite foreign key", () => {
  assert.match(migration, /unique index documents_id_student_unique[\s\S]*?documents\(id, student_id\)/);
  assert.match(migration, /foreign key \(document_id, student_id\)[\s\S]*?references public\.documents\(id, student_id\)/);
  assert.match(migration, /references public\.documents\(id, student_id\)[\s\S]*?on delete set null \(document_id\)/);
});

test("students can read only their records and only Admin can manage classifications", () => {
  assert.match(migration, /alter table public\.academic_evidence enable row level security/);
  assert.match(migration, /for select to authenticated[\s\S]*?student_id = \(select auth\.uid\(\)\)/);
  assert.match(
    migration,
    /academic evidence admin manage[\s\S]*?for all to authenticated[\s\S]*?using \(\(select public\.is_admin\(\)\)\)[\s\S]*?with check \(\(select public\.is_admin\(\)\)\)/,
  );
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

test("deleting a document resets every linked evidence row, not only accepted ones", () => {
  const deleteBranch = migration.match(
    /if tg_op = 'DELETE' then([\s\S]*?)return old;/,
  );
  assert.ok(deleteBranch, "expected a DELETE branch in the invalidation trigger");
  assert.match(deleteBranch[1], /verification_status = 'needs_review'/);
  assert.match(deleteBranch[1], /document_id = null/);
  assert.match(deleteBranch[1], /verified_by = null/);
  assert.match(deleteBranch[1], /verified_at = null/);
  assert.match(deleteBranch[1], /where document_id = old\.id/);
  // Unlike the status-downgrade branch, the delete branch must not be scoped
  // to accepted_for_pathway rows only: a deleted document orphans every
  // classification that pointed at it, whatever its current review state.
  assert.doesNotMatch(deleteBranch[1], /and verification_status/);
});

test("the acceptance trigger re-validates on every column update, not only verification_status changes", () => {
  assert.match(
    migration,
    /create trigger academic_evidence_enforce_contract\s+before insert or update on public\.academic_evidence/,
  );
  assert.doesNotMatch(
    migration,
    /create trigger academic_evidence_enforce_contract\s+before insert or update of/,
  );
});

test("the migration does not rewrite uploaded objects or existing document review statuses", () => {
  assert.doesNotMatch(migration, /storage\.objects|storage_path|original_filename|update public\.documents/);
  assert.doesNotMatch(migration, /alter type public\.document_status|drop type public\.document_status/);
});


test("accepted evidence locks the linked document strongly enough to serialize status downgrades", () => {
  const enforcement = migration.match(
    /create or replace function private\.enforce_academic_evidence\(\)([\s\S]*?)revoke execute on function private\.enforce_academic_evidence\(\)/,
  );
  assert.ok(enforcement, "expected academic evidence enforcement function");
  assert.match(
    enforcement[1],
    /from public\.documents[\s\S]*?where id = new\.document_id and student_id = new\.student_id[\s\S]*?for update;/,
  );
  assert.doesNotMatch(enforcement[1], /for key share;/i);
  assert.match(migration, /create trigger documents_invalidate_academic_evidence/);
  assert.match(migration, /linked_document\.status::text <> 'approved'/);
  // Static contract only: live concurrent Postgres behavior is validated separately.
});
