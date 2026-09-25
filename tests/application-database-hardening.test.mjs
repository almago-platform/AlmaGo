import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const migration = readFileSync("supabase/migrations/0015_germany_application_workflow_hardening.sql", "utf8");
const route = readFileSync("src/app/api/admin/applications/[id]/status/route.ts", "utf8");
test("Student inserts remain recommendation-bound and start only at interested", () => {
  for (const pattern of [
    /applications\.student_id = \(select auth\.uid\(\)\)/,
    /applications\.status::text = 'interested'/,
    /recommendation\.student_id = \(select auth\.uid\(\)\)/,
    /not recommendation\.is_archived/,
    /recommendation\.status in \('recommended', 'possible', 'ambitious', 'missing_requirements'\)/,
  ]) assert.match(migration, pattern);
});
test("Student inserts cannot pre-fill Admin or post-submission evidence", () => {
  for (const pattern of [
    /applications\.submitted_at is null/,
    /applications\.result is null/,
    /applications\.reviewed_at is null/,
    /applications\.student_notes is null/,
    /cardinality\(applications\.required_documents\)/,
  ]) assert.match(migration, pattern);
});
test("Student intake and deadline are tied to the publishable program", () => {
  for (const pattern of [
    /applications\.intake = any\(program\.intake_terms\)/,
    /applications\.deadline is not distinct from/,
    /program\.winter_deadline/,
    /program\.summer_deadline/,
    /timezone\('Europe\/Berlin', now\(\)\)/,
    /program\.is_active/,
    /program\.source_url ~\* '\^https\?:\/\/'/,
    /program\.application_url ~\* '\^https\?:\/\/'/,
    /program\.verified_at <= now\(\)/,
  ]) assert.match(migration, pattern);
});
test("table trigger enforces the canonical graph for every status update path", () => {
  assert.match(migration, /create trigger applications_enforce_status_transition/);
  assert.match(migration, /before update of status, student_notes, submitted_at/);
  assert.match(migration, /private\.application_transition_allowed\(old\.status::text, new\.status::text\)/);
  assert.match(migration, /when 'draft' then 'interested'/);
  assert.match(migration, /when 'waiting_university' then target_status in \('admission', 'rejection', 'withdrawn'\)/);
  assert.match(migration, /application_transition_not_allowed/);
});
test("decision notes and submitted_at are database-managed invariants", () => {
  assert.match(migration, /application_decision_note_required/);
  assert.match(migration, /application_submitted_at_managed/);
  assert.match(migration, /new\.submitted_at := coalesce\(old\.submitted_at, now\(\)\)/);
  assert.match(migration, /application_no_status_change/);
  assert.match(migration, /for update;/);
});
test("privileged helper and RPC execution are not exposed to PUBLIC or anon", () => {
  assert.match(migration, /revoke execute on function private\.application_transition_allowed\(text, text\) from public, anon/);
  assert.match(migration, /revoke execute on function public\.admin_update_application\([\s\S]*?from public, anon;/);
  assert.match(migration, /grant execute on function public\.admin_update_application\([\s\S]*?to authenticated;/);
});
test("Admin API maps transactional conflicts without exposing raw database errors", () => {
  for (const token of [
    "application_no_status_change",
    "application_transition_not_allowed",
    "application_decision_note_required",
  ]) assert.match(route, new RegExp(token));
  assert.match(route, /status: 409/);
  assert.doesNotMatch(route, /error\.message[^\n]*NextResponse\.json/);
});
