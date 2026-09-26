import assert from "node:assert/strict";
import test from "node:test";
import {
  toAdminAcademicEvidenceView,
  toStudentAcademicEvidenceView,
} from "../src/lib/academic-evidence-store.ts";

const now = new Date("2026-09-26T10:00:00Z");
const row = {
  id: "evidence-1",
  student_id: "student-1",
  evidence_type: "definitive_admission",
  institution: "Example Universität",
  evidence_date: "2026-09-20",
  origin: "official_document",
  verification_status: "accepted_for_pathway",
  document_id: "document-1",
  document_status: "approved",
  verified_at: "2026-09-25T10:00:00Z",
  created_at: "2026-09-24T09:00:00Z",
  updated_at: "2026-09-25T10:00:00Z",
};

test("Student evidence view exposes factual evidence state and computed assessment only", () => {
  const view = toStudentAcademicEvidenceView(row, now);
  assert.equal(view.type, "definitive_admission");
  assert.equal(view.verification_status, "accepted_for_pathway");
  assert.equal(view.document_status, "approved");
  assert.equal(view.assessment.status, "accepted");
  assert.equal(view.assessment.basis, "definitive_admission_basis");
  assert.equal(view.assessment.can_support_pathway_decision, true);
  assert.equal("student_id" in view, false);
  assert.equal("created_at" in view, false);
  assert.equal("updated_at" in view, false);
  assert.equal("verified_by" in view, false);
  assert.equal("admin_notes" in view, false);
});

test("Admin evidence view adds operational ownership/timestamps without inventing assessment", () => {
  const view = toAdminAcademicEvidenceView(row, now);
  assert.equal(view.student_id, "student-1");
  assert.equal(view.created_at, row.created_at);
  assert.equal(view.updated_at, row.updated_at);
  assert.equal(view.assessment.status, "accepted");
});

test("store view fails closed when linked document approval is absent", () => {
  const view = toStudentAcademicEvidenceView({
    ...row,
    document_status: "pending",
  }, now);
  assert.equal(view.assessment.status, "needs_review");
  assert.equal(view.assessment.can_support_pathway_decision, false);
});
