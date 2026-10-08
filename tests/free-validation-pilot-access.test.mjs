import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isFreeValidationPilotEnabled } from "../src/lib/phase2/config.ts";

const migration = readFileSync(
  "supabase/migrations/0048_free_validation_pilot_access.sql",
  "utf8",
);
const access = readFileSync("src/lib/auth/access.ts", "utf8");
const env = readFileSync(".env.example", "utf8");

test("FVL-4A pilot capability is disabled by default", () => {
  assert.match(env, /ALMAGO_FREE_VALIDATION_PILOT_ENABLED=false/);
  assert.equal(isFreeValidationPilotEnabled({}), false);
});

test("FVL-4A requires Phase 2, capture and account linking before pilot access", () => {
  const base = {
    ALMAGO_PARTNER_PRELAUNCH_MODE: "false",
    ALMAGO_FREE_VALIDATION_PILOT_ENABLED: "true",
  };

  assert.equal(isFreeValidationPilotEnabled(base), false);
  assert.equal(isFreeValidationPilotEnabled({
    ...base,
    ALMAGO_PHASE2_ENABLED: "true",
  }), false);
  assert.equal(isFreeValidationPilotEnabled({
    ...base,
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
  }), false);
  assert.equal(isFreeValidationPilotEnabled({
    ...base,
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
    ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED: "true",
  }), true);
});

test("Partner-Ready safety lock always disables the free pilot", () => {
  assert.equal(isFreeValidationPilotEnabled({
    ALMAGO_PARTNER_PRELAUNCH_MODE: "true",
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
    ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED: "true",
    ALMAGO_FREE_VALIDATION_PILOT_ENABLED: "true",
  }), false);
});

test("pilot access is append-only and separate from customer/payment lifecycle", () => {
  assert.match(migration, /create table if not exists public\.free_validation_pilot_access_events/);
  assert.match(migration, /action text not null check \(action in \('grant', 'revoke'\)\)/);
  assert.match(migration, /performed_by uuid references auth\.users/);
  assert.doesNotMatch(migration, /update\s+public\.free_validation_pilot_access_events/i);
  assert.doesNotMatch(migration, /delete\s+from\s+public\.free_validation_pilot_access_events/i);
  assert.doesNotMatch(
    migration,
    /(?:insert\s+into|update|delete\s+from)\s+public\.customer_access|(?:insert\s+into|update|delete\s+from)\s+public\.commercial_purchases/i,
  );
  assert.doesNotMatch(
    migration,
    /'payment_pending'|'paid_pending_validation'|'client_active'/i,
  );
});

test("pilot access events are read-only to users and writable only through bounded backend service role", () => {
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on table public\.free_validation_pilot_access_events from anon/);
  assert.match(migration, /grant select on table public\.free_validation_pilot_access_events to authenticated/);
  assert.match(migration, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/);
  assert.match(migration, /grant select, insert[\s\S]*to service_role/);
  assert.match(migration, /user_id = \(select auth\.uid\(\)\)[\s\S]*public\.is_admin/);
});

test("pilot grants never become generic student or client entitlement", () => {
  assert.doesNotMatch(access, /isFreeValidationPilotEnabled/);
  assert.doesNotMatch(access, /free_validation_pilot_access_events/);
  assert.doesNotMatch(access, /isFreePilotStudent/);
  assert.match(access, /hasClientLifecycleEntitlement\(access\?\.status\)/);
});

test("FVL-4A adds no automatic invitation, payment or document upload action", () => {
  for (const source of [migration, access]) {
    assert.doesNotMatch(
      source,
      /free_validation_interest_signals|sendTransactionalEmail|commercial_purchases|storage\.from\("student-documents"\)|qualified_prospect/i,
    );
  }
});
