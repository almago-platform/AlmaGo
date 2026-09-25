import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proposal = readFileSync("docs/data-api-student-write-boundary-proposal.md", "utf8");
const profileLib = readFileSync("src/lib/student/profile.ts", "utf8");
const profileRoute = readFileSync("src/app/api/student/profile/route.ts", "utf8");
const onboardingRoute = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");
const migrations = [
  "supabase/migrations/0001_initial_schema.sql",
  "supabase/migrations/0004_phase2_profile_upsert.sql",
  "supabase/migrations/0006_phase3_documents_checklist.sql",
].map((path) => readFileSync(path, "utf8")).join("\n");

test("Data API write-boundary proposal is explicitly non-applied", () => {
  assert.match(proposal, /PROPOSAL — \*\*NOT APPLIED\*\*/);
  assert.match(proposal, /Candidate SQL — DO NOT APPLY/);
});

test("profile application layer keeps an explicit student input allow-list", () => {
  assert.match(profileLib, /const stringKeys = \[/);
  assert.match(profileLib, /profileUpdateFromInput/);
  assert.match(profileRoute, /profileUpdateFromInput\(input\)/);
  assert.match(profileRoute, /validateProfileUpdate\(update\)/);
});

test("onboarding completion remains bound to consent and required fields", () => {
  assert.match(onboardingRoute, /input\.consentAccepted !== true/);
  assert.match(onboardingRoute, /consent_type: "profile_processing"/);
  assert.match(onboardingRoute, /update\.onboarding_completed = true/);
  assert.match(onboardingRoute, /update\.onboarding_completed_at = new Date\(\)\.toISOString\(\)/);
});

test("proposal does not treat column grants as sufficient for role-aware profile writes", () => {
  assert.match(proposal, /Both students and Admins reach Supabase as the PostgreSQL role `authenticated`/);
  assert.match(proposal, /Column grants alone are not sufficient/);
  assert.match(proposal, /BEFORE INSERT\/UPDATE profile guard/);
});

test("notification proposal narrows future student mutation to read_at", () => {
  assert.match(proposal, /grant update \(read_at\) on table public\.notifications to authenticated/);
  assert.match(proposal, /student can update only `read_at`/);
});

test("existing schema exposes the broad write boundary this proposal addresses", () => {
  assert.match(migrations, /notifications own update/);
  assert.match(migrations, /profiles own update/);
  assert.match(migrations, /grant select, insert, update on table public\.notifications to authenticated/);
});
