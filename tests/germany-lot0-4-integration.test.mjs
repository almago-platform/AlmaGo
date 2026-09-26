import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  evaluateAcademicMatch,
  programPublicationIssues,
} from "../src/lib/academic-match.ts";
import {
  assessAcademicEvidence,
  summarizeAcademicEvidence,
} from "../src/lib/academic-evidence.ts";
import { resolveApplicationIntake } from "../src/lib/application-intake.ts";
import { isUniversityDecisionStatus } from "../src/lib/application-workflow.ts";

const now = new Date("2026-09-25T12:00:00Z");

const project = {
  target_degree: "Master",
  target_field: "Computer Science",
  target_intake: "Hiver 2027",
  preferred_study_language: "English",
  preferred_cities: ["Berlin"],
  current_diploma: "Bachelor Computer Engineering",
  current_german_level: "B2",
};

const program = {
  degree_level: "Master",
  field: "Computer Science",
  teaching_language: "English",
  intake_terms: ["Wintersemester"],
  winter_deadline: "2027-07-15",
  summer_deadline: null,
  application_url: "https://example.edu/apply",
  source_url: "https://example.edu/program",
  verified_at: "2026-09-24T10:00:00Z",
  is_active: true,
  uni_assist_required: false,
  diploma_required: null,
  german_level_required: null,
  english_level_required: null,
  university_city: "Berlin",
};

const evidence = {
  type: "definitive_admission",
  institution: "Example Universität",
  evidence_date: "2026-09-20",
  origin: "official_document",
  verification_status: "accepted_for_pathway",
  document_id: "document-1",
  document_status: "approved",
  verified_at: "2026-09-24T10:00:00Z",
};

test("verified catalogue items may reach matching while inactive or unverified items fail closed", () => {
  assert.deepEqual(programPublicationIssues(program, now), []);
  assert.equal(evaluateAcademicMatch(project, program, now).status, "eligible_for_review");

  for (const candidate of [
    { ...program, is_active: false },
    { ...program, verified_at: null },
    { ...program, source_url: "javascript:alert(1)" },
    { ...program, application_url: null },
  ]) {
    assert.notDeepEqual(programPublicationIssues(candidate, now), []);
    assert.equal(evaluateAcademicMatch(project, candidate, now).status, "excluded");
  }
});

test("unknown deadline remains unknown and is never manufactured across intake and matching", () => {
  const intake = resolveApplicationIntake({
    target_intake: "Hiver 2027",
    intake_terms: ["Wintersemester"],
    winter_deadline: null,
    summer_deadline: null,
  }, now);

  assert.equal(intake.status, "resolved");
  assert.equal(intake.intake, "Wintersemester");
  assert.equal(intake.deadline, null);

  const match = evaluateAcademicMatch(project, { ...program, winter_deadline: null }, now);
  assert.equal(match.status, "needs_manual_review");
  assert.match(match.manual_checks.join(" "), /aucune date ne doit être inventée/i);
});

test("an application admission result remains separate from accepted academic evidence", () => {
  assert.equal(isUniversityDecisionStatus("admission"), true);

  const emptyEvidence = summarizeAcademicEvidence([], now);
  assert.equal(emptyEvidence.accepted_definitive_admission, false);
  assert.equal(emptyEvidence.accepted_preparatory_basis, false);
  assert.equal(emptyEvidence.accepted_evidence_count, 0);
});

test("definitive admission supports a pathway only after every existing fail-closed prerequisite passes", () => {
  const accepted = assessAcademicEvidence(evidence, now);
  assert.equal(accepted.status, "accepted");
  assert.equal(accepted.basis, "definitive_admission_basis");
  assert.equal(accepted.can_support_pathway_decision, true);

  for (const incomplete of [
    { ...evidence, origin: "student_declared" },
    { ...evidence, document_id: null },
    { ...evidence, document_status: "pending" },
    { ...evidence, verification_status: "needs_review" },
    { ...evidence, verified_at: null },
  ]) {
    assert.equal(assessAcademicEvidence(incomplete, now).can_support_pathway_decision, false);
  }
});

test("preparatory evidence types remain candidates until explicitly accepted", () => {
  for (const type of [
    "conditional_admission",
    "bewerberbestaetigung",
    "admissible_university_correspondence",
  ]) {
    const pending = assessAcademicEvidence({
      ...evidence,
      type,
      verification_status: "needs_review",
    }, now);
    assert.equal(pending.basis, "preparatory_academic_basis_candidate");
    assert.equal(pending.can_support_pathway_decision, false);

    const accepted = assessAcademicEvidence({ ...evidence, type }, now);
    assert.equal(accepted.status, "accepted");
    assert.equal(accepted.basis, "preparatory_academic_basis_candidate");
    assert.equal(accepted.can_support_pathway_decision, true);
  }
});

test("pending or replacement-required evidence never becomes accepted proof", () => {
  const summary = summarizeAcademicEvidence([
    { ...evidence, verification_status: "needs_review" },
    {
      ...evidence,
      document_id: "document-2",
      verification_status: "replace_required",
      document_status: "replace_required",
    },
  ], now);

  assert.equal(summary.accepted_definitive_admission, false);
  assert.equal(summary.accepted_preparatory_basis, false);
  assert.equal(summary.has_pending_review, true);
  assert.equal(summary.has_replacement_required, true);
  assert.equal(summary.accepted_evidence_count, 0);
});

test("LOT 0 through LOT 4 modules do not emit an automatic regulatory route or visa guarantee", () => {
  const source = [
    "src/lib/student/project.ts",
    "src/lib/academic-match.ts",
    "src/lib/master-requirements.ts",
    "src/lib/application-intake.ts",
    "src/lib/application-workflow.ts",
    "src/lib/academic-evidence.ts",
  ].map((path) => readFileSync(path, "utf8")).join("\n");

  assert.doesNotMatch(
    source,
    /\bSTUDIUM\b|\bSTUDIENVORBEREITUNG\b|\bSTUDIENPLATZSUCHE\b|\bSPRACHKURS\b/,
  );
  assert.doesNotMatch(source, /visa garanti|éligible au visa|probabilité de visa/i);
});
