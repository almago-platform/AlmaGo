import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261004193000_orientation_update_refreshes_intake.sql",
  "utf8",
);
const route = readFileSync("src/app/api/prospect/orientation/route.ts", "utf8");

test("orientation update atomically makes the new version the active intake orientation", () => {
  assert.match(
    migration,
    /create or replace function public\.append_phase2_orientation_qualification/i,
  );
  assert.match(migration, /insert into public\.orientations/i);
  assert.match(migration, /insert into public\.prospect_qualifications/i);
  assert.match(migration, /insert into public\.student_intake_cases/i);
  assert.match(migration, /orientation_id = excluded\.orientation_id/i);
  assert.match(migration, /orientation_confirmed_at = excluded\.orientation_confirmed_at/i);
  assert.match(migration, /private\.intake_has_approved_starter_documents\(p_user_id\)/i);
});

test("orientation update resets stale proposal state but preserves uploaded documents", () => {
  assert.match(migration, /proposed_route_key = null/i);
  assert.match(migration, /proposal_reason = null/i);
  assert.match(migration, /student_response = null/i);
  assert.match(migration, /procedure_id = null/i);
  assert.doesNotMatch(migration, /delete from public\.documents/i);
  assert.doesNotMatch(migration, /update public\.documents/i);
});

test("orientation update refuses to reset a created procedure", () => {
  assert.match(
    migration,
    /v_intake_status = 'procedure_created'[^;]*then\s*return/is,
  );
  assert.match(route, /student_intake_cases/);
  assert.match(route, /intakeCase\?\.status === "procedure_created"/);
  assert.match(route, /code: "procedure_already_created"/);
  assert.match(route, /status: 409/);
});

test("orientation update records an append-only history event and disables caching", () => {
  assert.match(migration, /'orientation_updated'/);
  assert.match(migration, /previous_orientation_id/);
  assert.match(route, /orientationId: saved\.orientation_id/);
  assert.match(route, /refreshed: true/);
  assert.match(route, /"Cache-Control": "no-store, max-age=0"/);
});
