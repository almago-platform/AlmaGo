import assert from "node:assert/strict";
import test from "node:test";
import {
  buildMasterRequirementsDocument,
  emptyMasterRequirementsForm,
  masterRequirementsFormFromDocument,
} from "../src/lib/master-requirements-form.ts";

const valid = (extra = {}) => ({
  ...emptyMasterRequirementsForm,
  minimum_ects: "180",
  source_url: "https://example.edu/master",
  verified_at: "2026-09-24",
  review_due_at: "2026-12-24",
  ...extra,
});

test("empty fields stay absent and route defaults to unknown", () => {
  assert.equal(emptyMasterRequirementsForm.application_route, "unknown");
  assert.equal(buildMasterRequirementsDocument({ ...emptyMasterRequirementsForm }).document, undefined);
  assert.equal(buildMasterRequirementsDocument(valid()).document?.application_route?.value, "unknown");
});

test("valid Admin values produce a versioned v1 document", () => {
  const result = buildMasterRequirementsDocument(valid({
    subject: "Mathematics", subject_ects: "20", prior_degree: "Related Bachelor",
    language: "English", language_level: "C1", intake: "Wintersemester",
    deadline: "2027-07-15", application_route: "uni_assist",
  }));
  assert.equal(result.document?.schema_version, 1);
  assert.equal(result.document?.kind, "master_requirements");
  assert.equal(result.document?.minimum_ects?.value, 180);
  assert.equal(result.document?.subject_credits?.[0].value, 20);
  assert.equal(result.document?.application_route?.value, "uni_assist");
});

test("unsafe or incomplete evidence fails closed", () => {
  assert.match(buildMasterRequirementsDocument(valid({ source_url: "http://example.edu" })).error ?? "", /HTTPS/i);
  assert.match(buildMasterRequirementsDocument(valid({ subject: "Mathematics" })).error ?? "", /ensemble/i);
  assert.match(buildMasterRequirementsDocument(valid({ language: "English" })).error ?? "", /ensemble/i);
  assert.equal(buildMasterRequirementsDocument(valid({ minimum_ects: "0" })).document, undefined);
});

test("editing pre-fills an existing document", () => {
  const document = buildMasterRequirementsDocument(valid({
    minimum_grade: "2.5", language: "English", language_level: "C1", application_route: "vpd",
  })).document;
  const form = masterRequirementsFormFromDocument(document);
  assert.deepEqual(
    [form.minimum_ects, form.minimum_grade, form.language, form.language_level, form.application_route, form.source_url],
    ["180", "2.5", "English", "C1", "vpd", "https://example.edu/master"],
  );
});

test("different existing evidence is surfaced instead of silently normalized", () => {
  const form = masterRequirementsFormFromDocument({
    schema_version: 1, kind: "master_requirements",
    minimum_ects: { value: 180, source_url: "https://example.edu/a", verified_at: "2026-09-24T00:00:00Z", review_due_at: "2026-12-24T00:00:00Z" },
    minimum_grade: { value: 2.5, source_url: "https://example.edu/b", verified_at: "2026-09-24T00:00:00Z", review_due_at: "2026-12-24T00:00:00Z" },
  });
  assert.equal(form.evidence_conflict, true);
});
