import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import { hasClientLifecycleEntitlement } from "../src/lib/auth/entitlement.ts";
import { isPhase2AccessEnabled } from "../src/lib/phase2/config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const migration = read("supabase/migrations/0033_phase2_prospect_access_foundation.sql");
const access = read("src/lib/phase2/access.ts");

test("Phase 2 feature flag is disabled by default", () => {
  assert.equal(isPhase2AccessEnabled({}), false);
  assert.equal(isPhase2AccessEnabled({ ALMAGO_PHASE2_ENABLED: "false" }), false);
  assert.equal(isPhase2AccessEnabled({ ALMAGO_PHASE2_ENABLED: "malformed" }), false);
  assert.equal(isPhase2AccessEnabled({ ALMAGO_PHASE2_ENABLED: "true" }), true);
});

test("client entitlement is independent from feature flag state", () => {
  for (const status of [
    null,
    "prospect_account",
    "qualified_prospect",
    "payment_pending",
    "paid_pending_validation",
  ]) {
    assert.equal(hasClientLifecycleEntitlement(status), false, String(status));
  }
  assert.equal(hasClientLifecycleEntitlement("client_active"), true);
  assert.equal(hasClientLifecycleEntitlement("client_completed"), true);
});

test("Phase 2 commercial lifecycle stays separate from technical roles", () => {
  assert.match(migration, /create type public\.customer_lifecycle_status/i);
  assert.match(migration, /'prospect_account'/);
  assert.match(migration, /'client_active'/);
  assert.doesNotMatch(migration, /alter\s+type\s+public\.app_role/i);
});

test("Phase 2 sensitive tables are RLS protected and anonymous access stays closed", () => {
  for (const table of ["prospects", "orientations", "customer_access"]) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
      table,
    );
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${table} from anon`, "i"),
      table,
    );
  }

  assert.doesNotMatch(migration, /create\s+policy[\s\S]+?to\s+anon/i);
  assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete)[^;]*to\s+anon/i);
});

test("existing students keep Phase 1 access while new accounts start as prospects", () => {
  assert.match(
    migration,
    /select ur\.user_id, 'client_active'::public\.customer_lifecycle_status[\s\S]+?where ur\.role = 'student'/i,
  );
  assert.match(
    migration,
    /insert into public\.customer_access \(user_id, status\)[\s\S]+?values \(new\.id, 'prospect_account'\)/i,
  );
});

test("authenticated clients cannot mutate commercial access directly", () => {
  assert.match(
    migration,
    /revoke insert, update, delete on table public\.customer_access from authenticated/i,
  );
  assert.match(migration, /customer access own or admin read/i);
});

test("server helper always derives client entitlement from lifecycle state", () => {
  assert.match(access, /getPhase2StudentAccess/);
  assert.match(access, /\.from\("customer_access"\)/);
  assert.match(access, /canUseClientFeatures\(customerStatus\)/);
  assert.doesNotMatch(access, /if \(!phase2Enabled\)/);
  assert.doesNotMatch(access, /customerStatus:\s*"client_active"/);
  assert.doesNotMatch(access, /canUseClientFeatures:\s*true/);
  assert.doesNotMatch(access, /user_metadata|raw_user_meta_data/);
});
