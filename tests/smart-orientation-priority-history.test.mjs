import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const migration = read("supabase/migrations/0046_smart_orientation_priority_history.sql");
const publicRoute = read("src/app/api/orientation/prospect/route.ts");
const accountRoute = read("src/app/api/prospect/orientation/route.ts");

test("SO-5 creates append-only priority history tied uniquely to an orientation", () => {
  assert.match(migration, /create table if not exists public\.smart_orientation_priority_history/);
  assert.match(migration, /orientation_id uuid not null unique/);
  assert.match(migration, /engine_version text not null/);
  assert.match(migration, /state public\.smart_orientation_priority_state not null/);
  assert.match(migration, /reason_codes text\[\] not null/);
  assert.match(migration, /requires_human_review boolean not null default false/);
});

test("SO-5 constrains priority states and explainable reason codes", () => {
  for (const state of [
    "priority_ready",
    "priority_prepare_now",
    "priority_standard",
    "priority_follow_up",
  ]) {
    assert.match(migration, new RegExp(`'${state}'`));
  }
  for (const reason of [
    "bac_obtained",
    "bac_preparing",
    "average_above_12",
    "average_12_or_below",
    "average_missing",
    "sensitive_field_human_review",
    "language_preparation_needed",
  ]) {
    assert.match(migration, new RegExp(`'${reason}'`));
  }
});

test("SO-5 history is readable only through existing linked-user/admin RLS", () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.smart_orientation_priority_history from anon/);
  assert.match(migration, /grant select on table public\.smart_orientation_priority_history to authenticated/);
  assert.match(migration, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/);
  assert.match(migration, /p\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /or \(select public\.is_admin\(\)\)/);
});

test("SO-5 trigger records priority in the same orientation insert transaction", () => {
  assert.match(migration, /create trigger orientations_record_smart_priority[\s\S]*after insert on public\.orientations/);
  assert.match(migration, /new\.input -> 'smart_priority'/);
  assert.match(migration, /insert into public\.smart_orientation_priority_history/);
  assert.match(migration, /on conflict \(orientation_id\) do nothing/);
});

test("SO-5 public prospect route recomputes Smart Priority server-side", () => {
  assert.match(publicRoute, /evaluateSmartOrientationPriority/);
  assert.match(publicRoute, /const smartPriority = evaluateSmartOrientationPriority\(answers\)/);
  assert.match(publicRoute, /smart_priority: smartPriority/);
});

test("SO-5 authenticated project update recomputes Smart Priority server-side", () => {
  assert.match(accountRoute, /evaluateSmartOrientationPriority/);
  assert.match(accountRoute, /const smartPriority = evaluateSmartOrientationPriority\(answers\)/);
  assert.match(accountRoute, /source: "prospect_account_update"[\s\S]*smart_priority: smartPriority/);
});

test("SO-5 never mutates commercial access or human qualification", () => {
  assert.doesNotMatch(migration, /update\s+public\.customer_access/i);
  assert.doesNotMatch(migration, /qualified_prospect/);
  assert.doesNotMatch(publicRoute, /qualified_prospect/);
  assert.doesNotMatch(accountRoute, /status\s*=\s*["']qualified_prospect/);
});

test("SO-5 preserves old priority history by never updating or deleting history rows", () => {
  assert.doesNotMatch(migration, /update\s+public\.smart_orientation_priority_history/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.smart_orientation_priority_history/i);
});
