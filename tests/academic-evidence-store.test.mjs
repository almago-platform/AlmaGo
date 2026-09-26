import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const store = readFileSync("src/lib/academic-evidence-store.ts", "utf8");

test("Student evidence view exposes the bounded factual evidence contract", () => {
  const studentType = store.match(
    /export type StudentAcademicEvidenceView = \{([\s\S]*?)\n\};/,
  )?.[1] || "";

  for (const field of [
    "id",
    "type",
    "institution",
    "evidence_date",
    "origin",
    "verification_status",
    "document_id",
    "document_status",
    "verified_at",
    "assessment",
  ]) {
    assert.match(studentType, new RegExp("\\b" + field + "\\b"), field);
  }

  assert.doesNotMatch(studentType, /student_id|created_at|updated_at|verified_by|admin_notes/);
});

test("Admin evidence view adds operational ownership and timestamps only", () => {
  assert.match(
    store,
    /export type AdminAcademicEvidenceView = StudentAcademicEvidenceView & \{[\s\S]*?student_id: string;[\s\S]*?created_at: string;[\s\S]*?updated_at: string;/,
  );
});

test("operational views derive assessment from the existing fail-closed domain contract", () => {
  assert.match(store, /assessAcademicEvidence\(assessmentInput\(row\), now\)/);
  assert.match(store, /document_status: row\.document_status/);
  assert.match(store, /verification_status: row\.verification_status/);
});

test("Student operational view contains no internal Admin note or verifier identity field", () => {
  const studentFunction = store.match(
    /export function toStudentAcademicEvidenceView\([\s\S]*?\n\}/,
  )?.[0] || "";
  assert.doesNotMatch(studentFunction, /admin_notes|verified_by|student_id|created_at|updated_at/);
});
