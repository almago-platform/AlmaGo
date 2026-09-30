import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0037_phase2_atomic_orientation_qualification.sql",
  "utf8",
);
const route = readFileSync("src/app/api/prospect/orientation/route.ts", "utf8");

test("P2.7C RPC is service-role-only and verifies the linked prospect owner", () => {
  assert.match(
    migration,
    /create or replace function public\.append_phase2_orientation_qualification/i,
  );
  assert.match(migration, /security definer/i);
  assert.match(migration, /select p\.user_id[\s\S]*from public\.prospects p[\s\S]*for update/i);
  assert.match(migration, /v_linked_user_id <> p_user_id/i);
  assert.match(
    migration,
    /revoke execute on function public\.append_phase2_orientation_qualification[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.append_phase2_orientation_qualification[\s\S]*to service_role/i,
  );
});

test("P2.7C serializes prospect updates and rejects stale expected orientation", () => {
  assert.match(migration, /for update/i);
  assert.match(
    migration,
    /order by o\.created_at desc, o\.id desc[\s\S]*limit 1/i,
  );
  assert.match(
    migration,
    /v_latest_orientation_id is distinct from p_expected_latest_orientation_id/i,
  );
  assert.match(route, /p_expected_latest_orientation_id: latestOrientation\?\.id \?\? null/);
  assert.match(route, /status: 409/);
});

test("one RPC transaction appends both orientation and automatic qualification", () => {
  assert.match(migration, /insert into public\.orientations/i);
  assert.match(migration, /returning id into v_orientation_id/i);
  assert.match(migration, /insert into public\.prospect_qualifications/i);
  assert.match(migration, /v_orientation_id,[\s\S]*p_qualification_engine_version/i);
  assert.match(
    migration,
    /'automatic'::public\.prospect_qualification_origin/i,
  );
  assert.match(
    migration,
    /return query[\s\S]*select v_orientation_id, v_qualification_id/i,
  );
});

test("automatic RPC cannot persist qualified_prospect or commercial access changes", () => {
  assert.match(
    migration,
    /p_qualification_state = 'qualified_prospect'::public\.prospect_qualification_state[\s\S]*return/i,
  );
  assert.doesNotMatch(migration, /insert into public\.customer_access/i);
  assert.doesNotMatch(migration, /update public\.customer_access/i);
  assert.doesNotMatch(migration, /client_active/i);
});

test("browser payload still contains only answers and locale, never identity or qualification state", () => {
  assert.match(route, /const record = body as Record<string, unknown>/);
  assert.match(route, /const answers = validAnswers\(record\.answers\)/);
  assert.match(route, /record\.locale/);
  assert.doesNotMatch(
    route,
    /record\.(?:prospect|prospectId|prospect_id|user|userId|user_id|orientation|orientationId|orientation_id|qualification|qualificationState|state)/,
  );
  assert.match(route, /p_user_id: access\.user\.id/);
  assert.match(route, /p_prospect_id: prospect\.id/);
  assert.match(route, /p_qualification_state: qualification\.state/);
});
