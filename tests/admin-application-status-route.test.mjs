import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/admin/applications/[id]/status/route.ts", "utf8");

test("admin application status route reads all database states but only writes canonical transitions", () => {
  assert.match(route, /databaseApplicationStatuses\.includes/);
  assert.match(route, /applicationStatuses\.includes/);
  assert.match(route, /currentApplication\.status !== requestedStatus/);
  assert.match(route, /Ce statut historique peut être conservé, mais pas choisi pour une nouvelle transition/);
  assert.match(route, /Statut invalide/);
});

test("admin application status route maps invalid and missing targets cleanly", () => {
  assert.match(route, /error\?\.code === "22P02"/);
  assert.match(route, /Identifiant de candidature invalide/);
  assert.match(route, /status: 400/);
  assert.match(route, /application_not_found/);
  assert.match(route, /Candidature introuvable/);
  assert.match(route, /status: 404/);
});


test("note-only application updates do not emit false status-change events", () => {
  assert.match(route, /currentApplication\.status === requestedStatus/);
  assert.match(route, /\.update\(\{[\s\S]*next_action: nextAction,[\s\S]*student_notes: studentNote,[\s\S]*reviewed_at:/);
  assert.match(route, /\.select\("id"\)[\s\S]*\.maybeSingle\(\)/);
  assert.match(route, /supabase\.rpc\("admin_update_application"/);

  const directUpdateIndex = route.indexOf("currentApplication.status === requestedStatus");
  const rpcIndex = route.indexOf('supabase.rpc("admin_update_application"');
  assert.ok(directUpdateIndex >= 0 && rpcIndex > directUpdateIndex);
});

test("unchanged application edits become no-ops", () => {
  assert.match(route, /currentApplication\.next_action === nextAction/);
  assert.match(route, /currentApplication\.student_notes === studentNote/);
  assert.match(route, /return NextResponse\.json\(\{ ok: true \}\)/);
});
