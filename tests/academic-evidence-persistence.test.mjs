import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assessAcademicEvidence } from "../src/lib/academic-evidence.ts";
import { academicEvidenceFromRow } from "../src/lib/academic-evidence-persistence.ts";

const migration = readFileSync("supabase/migrations/0016_germany_academic_evidence.sql", "utf8");
const now = new Date("2026-09-25T12:00:00Z");

test("persistence is linked to a private document and does not modify original file columns", () => {
  assert.match(migration, /document_id uuid not null unique references public\.documents\(id\)/);
  assert.match(migration, /No original document content is altered/);
  assert.doesNotMatch(migration, /alter table public\.documents\s+add column/i);
});

test("Student can read own evidence but only Admin can write evidence metadata", () => {
  assert.match(migration, /student_id = \(select auth\.uid\(\)\) or public\.is_admin\(\)/);
  assert.match(migration, /create policy "academic evidence admin write"/);
  assert.match(migration, /with check \(public\.is_admin\(\)\)/);
});

test("accepted pathway evidence requires an approved linked file and current Admin verifier", () => {
  assert.match(migration, /linked_status <> 'approved'/);
  assert.match(migration, /new\.verified_by is distinct from auth\.uid\(\)/);
  assert.match(migration, /academic_evidence_admin_required/);
});

test("future academic or verification dates fail at the database boundary", () => {
  assert.match(migration, /academic_evidence_future_date/);
  assert.match(migration, /academic_evidence_future_verification/);
});

test("row mapping always treats persisted academic evidence as document-backed", () => {
  const record = academicEvidenceFromRow({
    evidence_type: "definitive_admission",
    institution: " Example Universität ",
    evidence_date: "2026-09-20",
    verification_status: "accepted_for_pathway",
    document_id: "doc-1",
    document_status: "approved",
    verified_at: "2026-09-24T10:00:00Z",
  });
  assert.equal(record?.origin, "official_document");
  assert.equal(record?.institution, "Example Universität");
  assert.equal(assessAcademicEvidence(record, now).status, "accepted");
});

test("malformed or unknown persisted values fail closed", () => {
  for (const row of [
    { evidence_type: "unknown", institution: "Uni", evidence_date: "2026-09-20", verification_status: "needs_review", document_id: "d", verified_at: null },
    { evidence_type: "definitive_admission", institution: "", evidence_date: "2026-09-20", verification_status: "needs_review", document_id: "d", verified_at: null },
    { evidence_type: "definitive_admission", institution: "Uni", evidence_date: "2026-09-20", verification_status: "invented", document_id: "d", verified_at: null },
  ]) assert.equal(academicEvidenceFromRow(row), null);
});
