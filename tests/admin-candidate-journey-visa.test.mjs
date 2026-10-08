import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  CANDIDATE_JOURNEY,
  TUNISIA_GERMANY_VISA_TRACKS,
  OFFICIAL_PROCESS_LINKS,
  recommendedOperatorAction,
  firstKnownMilestone,
  sourceIsValidForYear,
} from "../src/lib/admin/candidate-journey.ts";

const page = readFileSync("src/app/admin/accompagnement/page.tsx", "utf8");
const intake = readFileSync("src/app/admin/intake/page.tsx", "utf8");
const standard = {
  hasAccount: true,
  orientationCount: 1,
  intakeStatus: null,
  recommendations: 0,
  applications: 0,
  currentProcedures: 0,
  pendingDocuments: 0,
  unreadStudentMessages: 0,
};

test("visitor-to-arrival playbook covers six different accountable phases", () => {
  assert.deepEqual(CANDIDATE_JOURNEY.map((item) => item.id), [
    "orientation", "qualification", "academic_application",
    "visa_preparation", "departure", "arrival",
  ]);
  for (const step of CANDIDATE_JOURNEY) {
    assert.ok(step.owner);
    assert.ok(step.completionEvidence.length > 12);
    assert.ok(step.where.startsWith("/admin/"));
  }
});

test("visa categories are distinct, documented and tied to real source URLs", () => {
  assert.deepEqual(TUNISIA_GERMANY_VISA_TRACKS.map((item) => item.key), [
    "studies", "study_preparation", "study_place_search",
  ]);
  const [studies, prep, search] = TUNISIA_GERMANY_VISA_TRACKS;
  assert.match(studies.purpose, /inconditionnelle/);
  assert.match(prep.evidence.join(" "), /20 heures\/semaine/);
  assert.match(prep.evidence.join(" "), /A2/);
  assert.match(search.purpose, /17\(2\)/);
  assert.match(search.financialNote, /1 091/);
  assert.match(studies.financialNote, /11 904/);
  for (const item of TUNISIA_GERMANY_VISA_TRACKS) {
    assert.equal(new URL(item.officialUrl).protocol, "https:");
    assert.ok(item.evidence.length >= 4);
  }
  assert.equal(new URL(OFFICIAL_PROCESS_LINKS.consularPortal).hostname, "digital.diplo.de");
});

test("operational action logic prioritizes unanswered people before documents or application work", () => {
  assert.equal(recommendedOperatorAction({ ...standard, unreadStudentMessages: 1, pendingDocuments: 1 }), "Répondre aux messages reçus");
  assert.equal(recommendedOperatorAction({ ...standard, pendingDocuments: 1, applications: 2 }), "Vérifier les documents reçus");
  assert.match(recommendedOperatorAction({ ...standard, applications: 1 }), /échéances/);
  assert.match(recommendedOperatorAction({ ...standard, intakeStatus: "student_question" }), /question/);
  assert.match(recommendedOperatorAction(standard), /orientation automatique/);
});

test("only officially verified deadlines may reorder the candidate work queue", () => {
  assert.match(page, /applicationDateIsTrusted\(application\)/);
  assert.match(page, /applicationOfficialDeadlineUrgency\(/);
  assert.match(page, /officialRiskByStudent/);
  assert.match(page, /officialDeadlineRisk === "overdue"/);
  assert.match(recommendedOperatorAction({ ...standard, officialDeadlineRisk: "overdue" }), /deadline universitaire officielle vérifiée/);
  assert.match(recommendedOperatorAction({ ...standard, officialDeadlineRisk: "within_7" }), /avant la deadline/);
});

test("displayed stage is an operational cue, never a synthetic visa verdict", () => {
  assert.equal(firstKnownMilestone(standard), "orientation");
  assert.equal(firstKnownMilestone({ ...standard, intakeStatus: "campus_review" }), "qualification");
  assert.equal(firstKnownMilestone({ ...standard, applications: 1 }), "academic_application");
  assert.equal(firstKnownMilestone({ ...standard, applications: 1 }, "submitted"), "visa_preparation");
  assert.equal(firstKnownMilestone({ ...standard, applications: 1 }, "approved"), "departure");
  assert.notEqual(firstKnownMilestone(standard, null), "arrival");
  assert.match(recommendedOperatorAction(standard, "approved"), /départ/);
  assert.match(recommendedOperatorAction(standard, "refused"), /décision consulaire/);
  assert.ok(!page.includes('visaStatus: "approved"'));
  assert.match(page, /Visa : aucune étape officiellement justifiée enregistrée/);
});

test("financial reference must be revisited on another calendar year", () => {
  assert.equal(sourceIsValidForYear(2026, 2026), true);
  assert.equal(sourceIsValidForYear(2026, 2027), false);
  assert.match(page, /referenceCurrent \? track\.financialNote/);
});

test("admin-only accompaniment reads existing tables and does not change real dossiers", () => {
  assert.match(page, /from\("prospects"\)/);
  assert.match(page, /from\("orientations"\)/);
  assert.match(page, /from\("student_intake_cases"\)/);
  assert.match(page, /from\("student_dossier_messages"\)/);
  assert.doesNotMatch(page, /\.insert\(|\.update\(|\.delete\(|service_role|createAdminClient/);
  assert.match(intake, /href="\/admin\/accompagnement"/);
  assert.match(page, /CANDIDATE_JOURNEY\.map/);
  assert.match(page, /TUNISIA_GERMANY_VISA_TRACKS\.map/);
  assert.match(page, /erased-/);
});
