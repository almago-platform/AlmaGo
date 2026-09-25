import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("supabase/proposals/0016_notification_column_privileges.sql", "utf8");
const notification = readFileSync("src/app/api/student/notifications/[id]/route.ts", "utf8");
const readAll = readFileSync("src/app/api/student/notifications/read-all/route.ts", "utf8");
const onboarding = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");

test("notification column hardening remains proposal-only", () => {
  assert.match(proposal, /PROPOSAL ONLY — DO NOT APPLY AUTOMATICALLY/);
});

test("student notification UPDATE is restricted to read_at", () => {
  assert.match(proposal, /revoke update on table public\.notifications from authenticated/i);
  assert.match(proposal, /grant update \(read_at\)\s+on table public\.notifications\s+to authenticated/i);
});

test("notification INSERT keeps only columns used by admin invoker functions", () => {
  assert.match(proposal, /revoke insert on table public\.notifications from authenticated/i);
  assert.match(proposal, /grant insert \(user_id, type, title, body, metadata\)\s+on table public\.notifications\s+to authenticated/i);
});

test("student notification routes only update read_at", () => {
  for (const source of [notification, readAll]) {
    assert.match(source, /\.update\(\{ read_at: readAt \}\)/);
    assert.doesNotMatch(source, /\.update\(\{[^}]*title:/s);
    assert.doesNotMatch(source, /\.update\(\{[^}]*body:/s);
    assert.doesNotMatch(source, /\.update\(\{[^}]*metadata:/s);
  }
});

test("profile workflow remains explicitly unresolved by this proposal", () => {
  assert.match(proposal, /does NOT change public\.profiles/);
  assert.match(onboarding, /update\.onboarding_completed = true/);
  assert.match(onboarding, /update\.onboarding_completed_at = new Date\(\)\.toISOString\(\)/);
});
