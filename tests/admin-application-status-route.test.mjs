import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/app/api/admin/applications/[id]/status/route.ts", "utf8");

test("admin application status route preserves the full status catalogue contract", () => {
  assert.match(route, /applicationStatuses\.includes/);
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
