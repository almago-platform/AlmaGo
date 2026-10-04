import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const migration = readFileSync(
  join(root, "supabase/migrations/0049_campus_allemagne_procedure_foundation.sql"),
  "utf8",
);

test("Campus Allemagne P1 creates versioned procedure and document requirement foundations", () => {
  for (const table of [
    "procedure_templates",
    "procedure_step_templates",
    "student_procedures",
    "student_document_requirements",
  ]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`, "i"));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  }

  assert.match(migration, /unique \(key, version\)/i);
  assert.match(migration, /template_snapshot jsonb not null default '\{\}'::jsonb/i);
  assert.match(migration, /create unique index if not exists student_procedures_one_current_per_student/i);
});

test("Campus Allemagne P1 preserves minimum student burden semantics", () => {
  assert.match(migration, /requested_from_student boolean not null default false/i);
  assert.match(
    migration,
    /not requested_from_student[\s\S]+student_request_reason is not null[\s\S]+char_length\(btrim\(student_request_reason\)\) > 0/i,
  );
  assert.match(migration, /requires_student_action boolean not null default false/i);
  assert.match(
    migration,
    /not requires_student_action[\s\S]+owner in \('student', 'joint'\)[\s\S]+student_action_reason is not null/i,
  );
});

test("Campus Allemagne P1 keeps official deadlines distinct from internal targets", () => {
  for (const deadlineKind of [
    "official_hard_deadline",
    "official_external_date",
    "internal_target",
    "source_review_date",
  ]) {
    assert.match(migration, new RegExp(`'${deadlineKind}'`));
  }

  assert.match(
    migration,
    /deadline_kind <> 'official_hard_deadline'[\s\S]+due_date is not null[\s\S]+source_url is not null[\s\S]+source_verified_at is not null[\s\S]+deadline_cycle is not null/i,
  );
  assert.match(
    migration,
    /deadline_kind <> 'official_hard_deadline'[\s\S]+official_source_url is not null[\s\S]+official_source_verified_at is not null[\s\S]+deadline_cycle is not null/i,
  );
});

test("Campus Allemagne P1 is admin-write and student-read for operational truth", () => {
  assert.match(migration, /create policy "student procedures own or admin read"/i);
  assert.match(migration, /create policy "student procedures admin write"/i);
  assert.match(migration, /create policy "document requirements own or admin read"/i);
  assert.match(migration, /create policy "document requirements admin write"/i);
  assert.match(migration, /create policy "procedure templates admin only"/i);
  assert.match(migration, /create policy "procedure step templates admin only"/i);
});

test("Campus Allemagne P1 records procedure and document requirement changes in student history", () => {
  assert.match(migration, /create or replace function private\.audit_campus_procedure_change\(\)/i);
  assert.match(migration, /insert into public\.student_history/i);
  assert.match(migration, /procedure_changed/i);
  assert.match(migration, /document_requirement_changed/i);
  assert.match(migration, /student_procedures_audit_change/i);
  assert.match(migration, /student_document_requirements_audit_change/i);
});
