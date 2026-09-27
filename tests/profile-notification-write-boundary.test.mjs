import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0029_profile_notification_write_boundary.sql", "utf8");
const profileRoute = readFileSync("src/app/api/student/profile/route.ts", "utf8");
const onboardingRoute = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");
const profileUpdateGrant =
  migration.match(/grant update \([^;]*\) on table public\.profiles to authenticated;/i)?.[0] || "";

test("direct profile writes cannot change workflow or maintenance columns", () => {
  assert.match(migration, /revoke insert, update on table public\.profiles from authenticated/i);
  assert.ok(profileUpdateGrant, "expected a restricted profile UPDATE grant");
  assert.match(profileUpdateGrant, /first_name/i);
  assert.doesNotMatch(profileUpdateGrant, /onboarding_completed/i);
  assert.doesNotMatch(profileUpdateGrant, /created_at/i);
  assert.doesNotMatch(profileUpdateGrant, /updated_at/i);
  assert.doesNotMatch(profileUpdateGrant, /full_name/i);
});

test("notifications are student-writable only through read_at", () => {
  assert.match(migration, /revoke update on table public\.notifications from authenticated/i);
  assert.match(migration, /grant update \(read_at\) on table public\.notifications to authenticated/i);
});

test("full name is derived in the database from first and last name", () => {
  assert.match(migration, /profiles_sync_full_name/);
  assert.match(migration, /concat_ws/);
  assert.doesNotMatch(profileRoute, /fullNameUpdate/);
});

test("onboarding completion is narrow, consent-gated and identity-bound", () => {
  assert.match(migration, /private\.complete_student_onboarding/);
  assert.match(migration, /caller uuid := auth\.uid\(\)/);
  assert.match(migration, /consent\.revoked_at is null/);
  assert.match(migration, /profile\.id = caller/);
  assert.match(migration, /onboarding_required_fields_missing/);
  assert.match(migration, /public\.complete_student_onboarding/);
  assert.match(migration, /security invoker/);
});

test("student onboarding route reactivates consent before invoking completion", () => {
  assert.match(onboardingRoute, /revoked_at: null/);
  assert.match(onboardingRoute, /granted_at: new Date\(\)\.toISOString\(\)/);
  assert.match(onboardingRoute, /supabase\.rpc\("complete_student_onboarding"\)/);
  assert.doesNotMatch(onboardingRoute, /update\.onboarding_completed/);
  assert.doesNotMatch(onboardingRoute, /update\.onboarding_completed_at/);
});
