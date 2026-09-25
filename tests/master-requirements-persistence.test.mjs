import assert from "node:assert/strict";
import test from "node:test";
import {
  masterRequirementsNamespace,
  masterRequirementsSchemaVersion,
  masterRequirementsToDocument,
  mergeMasterRequirementsIntoProgramRequirements,
  readMasterRequirementProfile,
  readMasterRequirementsDocument,
} from "../src/lib/master-requirements-persistence.ts";

const evidence = {
  source_url: "https://example.edu/master",
  verified_at: "2026-09-25T10:00:00Z",
  review_due_at: "2026-12-25T10:00:00Z",
};

const profile = {
  minimum_ects: { value: 180, ...evidence },
  minimum_grade: { value: 2.5, ...evidence },
  prior_degree: { value: null, free_text: "Related Bachelor", ...evidence },
  application_route: { value: "uni_assist", ...evidence },
  subject_credits: [{ subject: "Mathematics", value: 20, ...evidence }],
  languages: [{ language: "English", value: "C1", ...evidence }],
};

test("Master requirements use a dedicated versioned namespace", () => {
  const document = masterRequirementsToDocument(profile);
  assert.equal(document.schema_version, masterRequirementsSchemaVersion);
  assert.equal(document.kind, "master_requirements");
  assert.equal(masterRequirementsNamespace, "almago_master_requirements");
});

test("round-trip preserves explicit requirement evidence", () => {
  const merged = mergeMasterRequirementsIntoProgramRequirements({}, profile);
  const parsed = readMasterRequirementProfile(merged);
  assert.equal(parsed?.minimum_ects?.value, 180);
  assert.equal(parsed?.application_route?.value, "uni_assist");
  assert.equal(parsed?.subject_credits?.[0].subject, "Mathematics");
  assert.equal(parsed?.languages?.[0].value, "C1");
  assert.equal(parsed?.prior_degree?.free_text, "Related Bachelor");
});

test("legacy requirements are preserved instead of overwritten", () => {
  const merged = mergeMasterRequirementsIntoProgramRequirements(
    { legacy_note: "keep me", custom_flag: true },
    profile,
  );
  assert.equal(merged.legacy_note, "keep me");
  assert.equal(merged.custom_flag, true);
  assert.ok(merged[masterRequirementsNamespace]);
});

test("unknown schema versions fail closed", () => {
  const stored = {
    [masterRequirementsNamespace]: {
      schema_version: 999,
      kind: "master_requirements",
      minimum_ects: { value: 180, ...evidence },
    },
  };
  assert.equal(readMasterRequirementsDocument(stored), null);
  assert.equal(readMasterRequirementProfile(stored), null);
});

test("malformed requirement values fail closed", () => {
  const stored = {
    [masterRequirementsNamespace]: {
      schema_version: 1,
      kind: "master_requirements",
      minimum_ects: { value: "180", ...evidence },
    },
  };
  assert.equal(readMasterRequirementsDocument(stored), null);
});

test("legacy catalogue flags are never inferred into the new route contract", () => {
  assert.equal(
    readMasterRequirementProfile({ uni_assist_required: true, application_url: "https://example.edu" }),
    null,
  );
});

test("unknown application route strings fail closed", () => {
  const stored = {
    [masterRequirementsNamespace]: {
      schema_version: 1,
      kind: "master_requirements",
      application_route: { value: "portal_magic", ...evidence },
    },
  };
  assert.equal(readMasterRequirementProfile(stored), null);
});

test("non-object legacy requirements can be safely replaced by the namespaced document", () => {
  const merged = mergeMasterRequirementsIntoProgramRequirements("legacy text", profile);
  assert.deepEqual(Object.keys(merged), [masterRequirementsNamespace]);
  assert.equal(readMasterRequirementProfile(merged)?.minimum_grade?.value, 2.5);
});
