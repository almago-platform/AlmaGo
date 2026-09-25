import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0015_germany_application_workflow_hardening.sql",
  "utf8",
);
const route = readFileSync("src/app/api/admin/applications/[id]/status/route.ts", "utf8");

test("Student insert policy requires an owned active recommendation and canonical initial state", () => {
  assert.match(migration, /applications\.student_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /applications\.status::text = 'interested'/);
  assert.match(migration, /recommendation\.student_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /not recommendation\.is_archived/);
  assert.match(migration, /recommendation\.status <> 'not_recommended'/);
});

test("Student insert cannot pre-fill Admin-owned or post-submission evidence", () => {
  assert.match(migration, /applications\.submitted_at is null/);
  assert.match(migration, /applications\.result is null/);
  assert.match(migration, /applications\.reviewed_at is null/);
  assert.match(migration, /applications\.student_notes is null/);
  assert.match(migration, /cardinality\(applications\.required_documents\)/);
});

test("Student insert binds intake and deadline to the verified program", () => {
  assert.match(migration, /applications\.intake = any\(program\.intake_terms\)/);
  assert.match(migration, /private\.application_intake_family\(applications\.intake\)/);
  assert.match(migration, /program\.winter_deadline/);
  assert.match(migration, /program\.summer_deadline/);
  assert.match(migration, /applications\.deadline is not distinct from/);
  assert.match(migration, /timezone\('Europe\/Berlin', now\(\)\)/);
});

test("Student insert requires a publishable program instead of trusting recommendation history alone", () => {
  assert.match(migration, /program\.is_active/);
  assert.match(migration, /program\.source_url ~\* '\^https\?:\/\/'/);
  assert.match(migration, /program\.application_url ~\* '\^https\?:\/\/'/);
  assert.match(migration, /program\.verified_at is not null/);
  assert.match(migration, /program\.verified_at <= now\(\)/);
});

test("database RPC locks the row and enforces the canonical transition graph", () => {
  assert.match(migration, /for update;/);
  assert.match(migration, /when 'draft' then 'interested'/);
  assert.match(migration, /when 'in_review' then 'waiting_university'/);
  assert.match(migration, /application_no_status_change/);
  assert.match(migration, /application_transition_not_allowed/);
  assert.match(migration, /when 'waiting_university' then target_status_text in \('admission', 'rejection', 'withdrawn'\)/);
});

test("database RPC records submission once and requires a visible note for university decisions", () => {
  assert.match(migration, /application_decision_note_required/);
  assert.match(migration, /target_status_text = 'submitted' and target_application\.submitted_at is null/);
  assert.match(migration, /else target_application\.submitted_at/);
  assert.match(migration, /application_status_changed/);
});

test("RPC execution is not left granted to PUBLIC or anon", () => {
  assert.match(
    migration,
    /revoke execute on function public\.admin_update_application\([\s\S]*?from public, anon;/,
  );
  assert.match(
    migration,
    /grant execute on function public\.admin_update_application\([\s\S]*?to authenticated;/,
  );
});

test("Admin route maps transactional database conflicts without exposing raw SQL errors", () => {
  assert.match(route, /application_no_status_change/);
  assert.match(route, /application_transition_not_allowed/);
  assert.match(route, /application_decision_note_required/);
  assert.match(route, /status: 409/);
  assert.doesNotMatch(route, /error\.message[^\n]*NextResponse\.json/);
});
