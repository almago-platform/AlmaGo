import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const migration = readFileSync(
  join(root, "supabase/migrations/0050_campus_allemagne_procedure_generator.sql"),
  "utf8",
);

test("P2 seeds all approved Campus Allemagne route templates", () => {
  for (const route of [
    "studies_bachelor",
    "studies_master",
    "study_preparation",
    "study_place_search",
    "standalone_language",
    "ausbildung",
    "ausbildung_search",
    "research_doctorate",
    "study_internship",
  ]) {
    assert.match(migration, new RegExp(`'${route}'`));
  }

  assert.match(migration, /source_policy_version/i);
  assert.match(migration, /campus-allemagne-v1\.1/i);
});

test("P2 maps only existing student project paths and does not invent new enum values", () => {
  const mappings = [
    ["university_search", "study_place_search"],
    ["german_preparation_and_studies", "study_preparation"],
    ["master_and_language", "studies_master"],
    ["language_only", "standalone_language"],
  ];

  for (const [projectPath, route] of mappings) {
    assert.match(
      migration,
      new RegExp(`when '${projectPath}' then '${route}'`, "i"),
    );
  }

  assert.match(migration, /Unsupported student project path/i);
});

test("P2 snapshots dependencies, applicability and ownership semantics", () => {
  assert.match(migration, /procedure_step_templates/i);
  assert.match(migration, /student_required_by_default/i);
  assert.match(migration, /depends_on_keys/i);
  assert.match(migration, /applies_if/i);
  assert.match(
    migration,
    /requires_german_legalisation["']?:true|requires_german_legalisation":true/i,
  );
  assert.match(migration, /owner/i);
  assert.match(migration, /blocking/i);
});

test("P2 preserves minimum student burden before smart documents phase", () => {
  assert.match(
    migration,
    /'starter_documents'[\s\S]+?'student'[\s\S]+?true[\s\S]+?true/i,
  );

  for (const internalStep of [
    "academic_review",
    "tunisian_authentication",
    "german_legalisation",
    "certified_translation",
    "academic_eligibility",
    "language_path",
    "program_selection",
    "application_ready",
    "application_submitted",
    "application_followup",
    "financing",
    "insurance",
    "visa_submission",
    "arrival",
  ]) {
    const stepIndex = migration.indexOf(`'${internalStep}'`);
    assert.notEqual(stepIndex, -1, internalStep);
    const fragment = migration.slice(stepIndex, stepIndex + 450);
    assert.match(fragment, /'almago'|false/i, internalStep);
  }

  assert.doesNotMatch(migration, /insert into public\.student_document_requirements/i);
  assert.doesNotMatch(migration, /insert into public\.student_checklist_items/i);
});

test("P2 generator is admin-only and idempotent for an unchanged project snapshot", () => {
  assert.match(migration, /create or replace function public\.admin_generate_student_procedure\(p_student_id uuid\)/i);
  assert.match(migration, /security invoker/i);
  assert.match(migration, /if not public\.is_admin\(\) then/i);
  assert.match(
    migration,
    /current_record\.template_snapshot -> 'project' = project_snapshot[\s\S]+return current_record\.id/i,
  );
  assert.match(migration, /where procedure_templates\.route_key = v_route_key/i);
});

test("P2 route changes supersede the previous snapshot instead of mutating history", () => {
  assert.match(
    migration,
    /update public\.student_procedures[\s\S]+is_current = false[\s\S]+superseded_by = new_procedure_id/i,
  );
  assert.match(migration, /insert into public\.student_procedures/i);
  assert.match(migration, /template_snapshot/i);
  assert.match(migration, /project_snapshot/i);
});
