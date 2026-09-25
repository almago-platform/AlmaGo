import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMasterRequirementsDocument,
  emptyMasterRequirementsForm,
  masterRequirementsFormFromDocument,
} from "../src/lib/master-requirements-form.ts";

function validForm() {
  return {
    ...emptyMasterRequirementsForm,
    minimum_ects: "180",
    application_route: "unknown",
    source_url: "https://example.edu/master",
    verified_at: "2026-09-24",
    review_due_at: "2026-12-24",
  };
}

test("empty Master fields stay absent instead of becoming zero", () => {
  const result = buildMasterRequirementsDocument({ ...emptyMasterRequirementsForm });
  assert.equal(result.document, undefined);
  assert.equal(result.error, undefined);
});

test("route defaults to unknown", () => {
  assert.equal(emptyMasterRequirementsForm.application_route, "unknown");
  const result = buildMasterRequirementsDocument(validForm());
  assert.equal(result.document?.application_route?.value, "unknown");
});

test("valid Admin values produce a versioned v1 Master document", () => {
  const result = buildMasterRequirementsDocument({
    ...validForm(),
    subject: "Mathematics",
    subject_ects: "20",
    prior_degree: "Related Bachelor",
    language: "English",
    language_level: "C1",
    intake: "Wintersemester",
    deadline: "2027-07-15",
    application_route: "uni_assist",
  });
  assert.equal(result.error, undefined);
  assert.equal(result.document?.schema_version, 1);
  assert.equal(result.document?.kind, "master_requirements");
  assert.equal(result.document?.minimum_ects?.value, 180);
  assert.equal(result.document?.subject_credits?.[0].value, 20);
  assert.equal(result.document?.application_route?.value, "uni_assist");
});

test("non-HTTPS evidence is rejected instead of being submitted as verified", () => {
  const result = buildMasterRequirementsDocument({
    ...validForm(),
    source_url: "http://example.edu/master",
  });
  assert.match(result.error ?? "", /HTTPS/i);
  assert.equal(result.document, undefined);
});

test("partial structured pairs fail closed", () => {
  const subjectOnly = buildMasterRequirementsDocument({ ...validForm(), subject: "Mathematics" });
  assert.match(subjectOnly.error ?? "", /ensemble/i);
  const languageOnly = buildMasterRequirementsDocument({ ...validForm(), language: "English" });
  assert.match(languageOnly.error ?? "", /ensemble/i);
});

test("editing pre-fills an existing Master document", () => {
  const document = buildMasterRequirementsDocument({
    ...validForm(),
    minimum_grade: "2.5",
    language: "English",
    language_level: "C1",
    application_route: "vpd",
  }).document;
  const form = masterRequirementsFormFromDocument(document);
  assert.equal(form.minimum_ects, "180");
  assert.equal(form.minimum_grade, "2.5");
  assert.equal(form.language, "English");
  assert.equal(form.language_level, "C1");
  assert.equal(form.application_route, "vpd");
  assert.equal(form.source_url, "https://example.edu/master");
});

test("heterogeneous existing evidence is surfaced instead of silently normalized", () => {
  const form = masterRequirementsFormFromDocument({
    schema_version: 1,
    kind: "master_requirements",
    minimum_ects: {
      value: 180,
      source_url: "https://example.edu/a",
      verified_at: "2026-09-24T00:00:00.000Z",
      review_due_at: "2026-12-24T00:00:00.000Z",
    },
    minimum_grade: {
      value: 2.5,
      source_url: "https://example.edu/b",
      verified_at: "2026-09-24T00:00:00.000Z",
      review_due_at: "2026-12-24T00:00:00.000Z",
    },
  });
  assert.equal(form.evidence_conflict, true);
});
