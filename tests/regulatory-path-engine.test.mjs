import assert from "node:assert/strict";
import test from "node:test";
import {
  determineRegulatoryPath,
  regulatoryProjectPaths,
  regulatoryRoutes,
} from "../src/lib/regulatory-path-engine.ts";

const baseFacts = {
  project_path: "university_search",
  accepted_definitive_admission: false,
  accepted_preparatory_basis: false,
  has_publishable_study_preparation_course: false,
  has_pending_academic_review: false,
  has_replacement_required: false,
};

test("canonical route and project values remain exact", () => {
  assert.deepEqual([...regulatoryRoutes], [
    "STUDIUM",
    "STUDIENVORBEREITUNG",
    "STUDIENPLATZSUCHE",
    "SPRACHKURS",
  ]);
  assert.deepEqual([...regulatoryProjectPaths], [
    "university_search",
    "german_preparation_and_studies",
    "master_and_language",
    "language_only",
  ]);
});

test("definitive admission produces a confirmed STUDIUM basis", () => {
  const result = determineRegulatoryPath({
    ...baseFacts,
    accepted_definitive_admission: true,
  });
  assert.equal(result.route, "STUDIUM");
  assert.equal(result.status, "confirmed_basis");
  assert.equal(result.reason_code, "definitive_admission_accepted");
  assert.deepEqual(result.used_facts, ["accepted_definitive_admission"]);
  assert.deepEqual(result.missing_facts, []);
});

test("accepted preparatory basis plus publishable preparatory course confirms STUDIENVORBEREITUNG", () => {
  const result = determineRegulatoryPath({
    ...baseFacts,
    accepted_preparatory_basis: true,
    has_publishable_study_preparation_course: true,
  });
  assert.equal(result.route, "STUDIENVORBEREITUNG");
  assert.equal(result.status, "confirmed_basis");
  assert.equal(result.reason_code, "preparatory_basis_and_course_confirmed");
});

test("accepted preparatory basis without a suitable verified course stays blocked", () => {
  const result = determineRegulatoryPath({
    ...baseFacts,
    accepted_preparatory_basis: true,
    has_publishable_study_preparation_course: false,
  });
  assert.equal(result.route, null);
  assert.equal(result.status, "blocked");
  assert.equal(result.reason_code, "preparatory_course_missing");
  assert.deepEqual(result.missing_facts, ["has_publishable_study_preparation_course"]);
  assert.match(result.student_explanation, /base académique préparatoire/i);
  assert.match(result.student_explanation, /cours préparatoire vérifié/i);
});

test("language-only project maps to a SPRACHKURS candidate without claiming approval", () => {
  const result = determineRegulatoryPath({
    ...baseFacts,
    project_path: "language_only",
  });
  assert.equal(result.route, "SPRACHKURS");
  assert.equal(result.status, "candidate");
  assert.equal(result.reason_code, "language_only_project");
});

test("university-search projects expose STUDIENPLATZSUCHE only as a candidate to examine", () => {
  for (const project_path of [
    "university_search",
    "german_preparation_and_studies",
    "master_and_language",
  ]) {
    const result = determineRegulatoryPath({ ...baseFacts, project_path });
    assert.equal(result.route, "STUDIENPLATZSUCHE");
    assert.equal(result.status, "candidate");
    assert.equal(result.reason_code, "study_place_search_candidate");
    assert.match(result.student_explanation, /à examiner/i);
  }
});

test("pending or replacement-required evidence blocks fallback candidate routes", () => {
  const pending = determineRegulatoryPath({
    ...baseFacts,
    has_pending_academic_review: true,
  });
  assert.equal(pending.route, null);
  assert.equal(pending.status, "blocked");
  assert.equal(pending.reason_code, "academic_evidence_pending_review");

  const replacement = determineRegulatoryPath({
    ...baseFacts,
    project_path: "language_only",
    has_replacement_required: true,
  });
  assert.equal(replacement.route, null);
  assert.equal(replacement.status, "blocked");
  assert.equal(replacement.reason_code, "academic_evidence_replacement_required");
});

test("definitive admission takes precedence over a stale language-only project state", () => {
  const result = determineRegulatoryPath({
    ...baseFacts,
    project_path: "language_only",
    accepted_definitive_admission: true,
    has_pending_academic_review: true,
    has_replacement_required: true,
  });
  assert.equal(result.route, "STUDIUM");
  assert.equal(result.status, "confirmed_basis");
});

test("unknown or missing project path fails closed when no accepted basis exists", () => {
  for (const project_path of [null, "", "visa_only", "unknown"]) {
    const result = determineRegulatoryPath({ ...baseFacts, project_path });
    assert.equal(result.route, null);
    assert.equal(result.status, "blocked");
    assert.equal(result.reason_code, "project_path_missing_or_unknown");
    assert.deepEqual(result.missing_facts, ["project_path"]);
  }
});

test("engine output never contains guarantee or probability language", () => {
  const scenarios = [
    { ...baseFacts, accepted_definitive_admission: true },
    {
      ...baseFacts,
      accepted_preparatory_basis: true,
      has_publishable_study_preparation_course: true,
    },
    { ...baseFacts, accepted_preparatory_basis: true },
    { ...baseFacts, project_path: "language_only" },
    { ...baseFacts, project_path: "master_and_language" },
    { ...baseFacts, has_pending_academic_review: true },
    { ...baseFacts, has_replacement_required: true },
  ];

  for (const scenario of scenarios) {
    const result = determineRegulatoryPath(scenario);
    const serialized = JSON.stringify(result);
    assert.doesNotMatch(
      serialized,
      /visa garanti|éligible au visa|probabilit[ée]|chance d['’]admission|garantie d['’]admission/i,
    );
  }
});
