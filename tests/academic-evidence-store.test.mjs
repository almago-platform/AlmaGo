import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { assessAcademicEvidence } from "../src/lib/academic-evidence.ts";

const store = readFileSync("src/lib/academic-evidence-store.ts", "utf8");

test("Student evidence view exposes only the bounded factual evidence contract", () => {
  const studentView = store.match(
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
    assert.match(studentView, new RegExp(`\\b${field}\\b`), field);
  }

  assert.doesNotMatch(studentView, /student_id|created_at|updated_at|verified_by|admin_notes/);
});

test("Admin evidence view adds ownership and timestamps without adding internal notes", () => {
  assert.match(
    store,
    /export type AdminAcademicEvidenceView = StudentAcademicEvidenceView & \{[\s\S]*?student_id: string;[\s\S]*?created_at: string;[\s\S]*?updated_at: string;/,
  );
  assert.doesNotMatch(store, /admin_notes/);
});

test("operational views reuse the canonical academic evidence assessment", () => {
  assert.match(store, /assessAcademicEvidence\(assessmentInput\(row\), now\)/);

  const assessment = assessAcademicEvidence({
    type: "definitive_admission",
    institution: "Example Universität",
    evidence_date: "2026-09-20",
    origin: "official_document",
    verification_status: "accepted_for_pathway",
    document_id: "document-1",
    document_status: "approved",
    verified_at: "2026-09-25T10:00:00Z",
  }, new Date("2026-09-26T10:00:00Z"));

  assert.equal(assessment.status, "accepted");
  assert.equal(assessment.basis, "definitive_admission_basis");
  assert.equal(assessment.can_support_pathway_decision, true);
});

test("canonical assessment still fails closed when linked document approval is absent", () => {
  const assessment = assessAcademicEvidence({
    type: "definitive_admission",
    institution: "Example Universität",
    evidence_date: "2026-09-20",
    origin: "official_document",
    verification_status: "accepted_for_pathway",
    document_id: "document-1",
    document_status: "pending",
    verified_at: "2026-09-25T10:00:00Z",
  }, new Date("2026-09-26T10:00:00Z"));

  assert.equal(assessment.status, "needs_review");
  assert.equal(assessment.can_support_pathway_decision, false);
});
