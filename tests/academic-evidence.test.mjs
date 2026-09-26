import assert from "node:assert/strict";
import test from "node:test";
import {
  assessAcademicEvidence,
  summarizeAcademicEvidence,
} from "../src/lib/academic-evidence.ts";

const now = new Date("2026-09-25T12:00:00Z");

const base = {
  type: "definitive_admission",
  institution: "Example Universität",
  evidence_date: "2026-09-20",
  origin: "official_document",
  verification_status: "accepted_for_pathway",
  document_id: "document-1",
  document_status: "approved",
  verified_at: "2026-09-24T10:00:00Z",
};

test("approved file alone is not enough without explicit pathway acceptance", () => {
  const result = assessAcademicEvidence({
    ...base,
    verification_status: "needs_review",
  }, now);
  assert.equal(result.status, "needs_review");
  assert.equal(result.can_support_pathway_decision, false);
});

test("student declarations and admin facts without an official document never become pathway evidence", () => {
  for (const origin of ["student_declared", "admin_verified_fact"]) {
    const result = assessAcademicEvidence({ ...base, origin }, now);
    assert.equal(result.status, "needs_review");
    assert.equal(result.can_support_pathway_decision, false);
  }
});

test("definitive admission can become accepted evidence only with approved official document", () => {
  const result = assessAcademicEvidence(base, now);
  assert.equal(result.status, "accepted");
  assert.equal(result.basis, "definitive_admission_basis");
  assert.equal(result.can_support_pathway_decision, true);
});

test("conditional admission and university confirmations stay preparatory-basis candidates", () => {
  for (const type of [
    "conditional_admission",
    "bewerberbestaetigung",
    "admissible_university_correspondence",
  ]) {
    const result = assessAcademicEvidence({ ...base, type }, now);
    assert.equal(result.status, "accepted");
    assert.equal(result.basis, "preparatory_academic_basis_candidate");
    assert.equal(result.can_support_pathway_decision, true);
  }
});

test("missing institution, invalid date or future evidence date fails closed", () => {
  assert.equal(assessAcademicEvidence({ ...base, institution: "" }, now).status, "incomplete");
  assert.equal(assessAcademicEvidence({ ...base, evidence_date: "2026-02-30" }, now).status, "incomplete");
  assert.equal(assessAcademicEvidence({ ...base, evidence_date: "2026-10-01" }, now).status, "incomplete");
});

test("replacement-required document cannot support a pathway decision", () => {
  const result = assessAcademicEvidence({
    ...base,
    verification_status: "replace_required",
    document_status: "replace_required",
  }, now);
  assert.equal(result.status, "replace_required");
  assert.equal(result.basis, "none");
  assert.equal(result.can_support_pathway_decision, false);
});

test("missing or future admin verification stays under review", () => {
  assert.equal(assessAcademicEvidence({ ...base, verified_at: null }, now).status, "needs_review");
  assert.equal(
    assessAcademicEvidence({ ...base, verified_at: "2026-09-26T10:00:00Z" }, now).status,
    "needs_review",
  );
});

test("summary separates definitive admission, preparatory evidence and unresolved items", () => {
  const summary = summarizeAcademicEvidence([
    base,
    { ...base, type: "conditional_admission", document_id: "document-2" },
    { ...base, type: "bewerberbestaetigung", document_id: "document-3", verification_status: "needs_review" },
    { ...base, document_id: "document-4", verification_status: "replace_required", document_status: "replace_required" },
  ], now);

  assert.equal(summary.accepted_definitive_admission, true);
  assert.equal(summary.accepted_preparatory_basis, true);
  assert.equal(summary.has_pending_review, true);
  assert.equal(summary.has_replacement_required, true);
  assert.equal(summary.accepted_evidence_count, 2);
});

test("no evidence means no accepted academic basis without inventing one", () => {
  assert.deepEqual(summarizeAcademicEvidence([], now), {
    accepted_definitive_admission: false,
    accepted_preparatory_basis: false,
    has_pending_review: false,
    has_replacement_required: false,
    accepted_evidence_count: 0,
  });
});

test("a logically inconsistent accepted_for_pathway record without an approved document still fails closed", () => {
  // Defense in depth: the database trigger should already prevent this shape,
  // but the assessment must never assume the record it receives is consistent.
  for (const inconsistent of [
    { ...base, document_id: null },
    { ...base, document_status: "rejected" },
    { ...base, document_status: null },
  ]) {
    const result = assessAcademicEvidence(inconsistent, now);
    assert.equal(result.status, "needs_review");
    assert.equal(result.can_support_pathway_decision, false);
  }
});
