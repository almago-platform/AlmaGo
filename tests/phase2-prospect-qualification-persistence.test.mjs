import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0036_phase2_prospect_qualification_history.sql",
  "utf8",
);
const qualification = readFileSync("src/lib/phase2/qualification.ts", "utf8");

test("P2.7B database state model stays aligned with the deterministic domain", () => {
  for (const state of [
    "not_evaluated",
    "too_early",
    "needs_information",
    "needs_verification",
    "ready_for_review",
    "qualified_prospect",
  ]) {
    assert.match(migration, new RegExp(`'${state}'`));
    assert.match(qualification, new RegExp(`"${state}"`));
  }
});

test("qualification persistence rejects unknown semantic codes", () => {
  for (const constraint of [
    "prospect_qualifications_reason_codes_known",
    "prospect_qualifications_missing_fields_known",
    "prospect_qualifications_verification_known",
    "prospect_qualifications_next_action_known",
  ]) {
    assert.match(migration, new RegExp(constraint));
  }

  for (const value of [
    "ready_for_human_review",
    "targetDegree",
    "application_route_and_deadline",
    "request_human_review",
  ]) {
    assert.match(migration, new RegExp(`'${value}'`));
  }
});

test("qualification history is orientation-linked and append-only", () => {
  assert.match(migration, /create table if not exists public\.prospect_qualifications/i);
  assert.match(
    migration,
    /orientation_id uuid not null references public\.orientations\(id\) on delete cascade/i,
  );
  assert.match(migration, /created_at timestamptz not null default now\(\)/i);
  assert.doesNotMatch(migration, /updated_at/i);
  assert.match(
    migration,
    /revoke update, delete, truncate[\s\S]*from service_role/i,
  );
});

test("automatic qualification cannot promote to qualified_prospect and is idempotent per orientation version", () => {
  assert.match(
    migration,
    /origin = 'automatic'::public\.prospect_qualification_origin[\s\S]*state = 'qualified_prospect'::public\.prospect_qualification_state/i,
  );
  assert.match(
    migration,
    /create unique index if not exists prospect_qualifications_auto_once_idx[\s\S]*\(orientation_id, engine_version\)[\s\S]*where origin = 'automatic'/i,
  );
});

test("human review records require an auditable reviewer and reason", () => {
  assert.match(migration, /reviewer_user_id uuid references auth\.users\(id\)/i);
  assert.match(migration, /review_reason text/i);
  assert.match(
    migration,
    /origin <> 'automatic'::public\.prospect_qualification_origin[\s\S]*reviewer_user_id is not null[\s\S]*review_reason is not null/i,
  );
  assert.match(
    migration,
    /supersedes_id uuid references public\.prospect_qualifications\(id\)/i,
  );
});

test("qualification table is RLS protected with owner/admin reads and no browser writes", () => {
  assert.match(
    migration,
    /alter table public\.prospect_qualifications enable row level security/i,
  );
  assert.match(
    migration,
    /revoke all on table public\.prospect_qualifications from anon/i,
  );
  assert.match(
    migration,
    /grant select on table public\.prospect_qualifications to authenticated/i,
  );
  assert.match(
    migration,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/i,
  );
  assert.match(
    migration,
    /from public\.orientations o[\s\S]*join public\.prospects p on p\.id = o\.prospect_id[\s\S]*p\.user_id = \(select auth\.uid\(\)\)/i,
  );
  assert.match(migration, /or \(select public\.is_admin\(\)\)/i);
  assert.doesNotMatch(migration, /to anon[\s\S]*using/i);
});

test("P2.7B does not mutate commercial entitlement", () => {
  assert.doesNotMatch(migration, /insert into public\.customer_access/i);
  assert.doesNotMatch(migration, /update public\.customer_access/i);
  assert.doesNotMatch(migration, /delete from public\.customer_access/i);
  assert.doesNotMatch(migration, /client_active/);
});
