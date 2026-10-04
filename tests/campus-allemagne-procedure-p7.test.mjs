import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const migration = readFileSync(join(root, "supabase/migrations/0053_campus_allemagne_notifications.sql"), "utf8");

test("P7 reminder materialization is idempotent", () => {
  assert.match(migration, /notifications_campus_dedupe_idx/i);
  assert.match(migration, /metadata ->> 'dedupe_key'/i);
  assert.match(migration, /on conflict \(\(metadata ->> 'dedupe_key'\)\)/i);
});

test("P7 only notifies explicit student actions with reasons", () => {
  assert.match(migration, /requested_from_student/i);
  assert.match(migration, /student_request_reason is not null/i);
  assert.match(migration, /requires_student_action/i);
  assert.match(migration, /owner in \('student', 'joint'\)/i);
  assert.match(migration, /student_action_reason is not null/i);
  assert.doesNotMatch(migration, /owner = 'almago'.*campus_student_action/is);
});

test("P7 official deadline reminders require provenance and never use internal targets", () => {
  assert.match(migration, /deadline_kind = 'official_hard_deadline'/i);
  assert.match(migration, /deadline_source_url ~\* '\^https\?:\/\/'/i);
  assert.match(migration, /deadline_verified_at is not null/i);
  assert.match(migration, /deadline_cycle is not null/i);
  assert.match(migration, /remaining\.days in \(30, 14, 7, 3, 1, 0\)/i);
  assert.doesNotMatch(migration, /deadline_kind = 'internal_target'/i);
});

test("P7 notification enqueue is admin-only and repeatedly callable", () => {
  assert.match(migration, /create or replace function public\.admin_enqueue_campus_notifications/i);
  assert.match(migration, /if not public\.is_admin\(\) then/i);
  assert.match(migration, /returns integer/i);
  assert.match(migration, /grant execute on function public\.admin_enqueue_campus_notifications/i);
});
