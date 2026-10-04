import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261004203500_orientation_aachen_aerospace_catalog.sql",
  "utf8",
);
const rules = readFileSync("src/lib/orientation-engine/rules.ts", "utf8");

test("Aachen Aerospace catalogue seed uses the canonical verified FH Aachen identity", () => {
  assert.match(migration, /canonical_key = 'host:fh-aachen\.de'/i);
  assert.match(migration, /registry_status = 'verified_catalogue'/i);
  assert.match(migration, /city = 'Aachen'/i);
});

test("FH Aachen Aerospace Bachelor is seeded with verified official evidence", () => {
  assert.match(migration, /'Luft- und Raumfahrttechnik'/);
  assert.match(migration, /'Bachelor'/);
  assert.match(migration, /'Aerospace Engineering'/);
  assert.match(migration, /'German'/);
  assert.match(migration, /'B2'/);
  assert.match(migration, /uni_assist_required = true/i);
  assert.match(
    migration,
    /https:\/\/www\.fh-aachen\.de\/studium\/studiengaenge\/luft-und-raumfahrttechnik-beng/,
  );
  assert.match(migration, /source_checked_on', '2026-10-04'/);
});

test("Aerospace matching recognises the German programme name", () => {
  assert.match(
    rules,
    /aerospace:\s*\[[^\]]*"aerospace"[^\]]*"aeronaut"[^\]]*"luft"[^\]]*"raumfahrt"[^\]]*\]/s,
  );
});

test("the seed does not invent a RWTH Aerospace Bachelor", () => {
  assert.doesNotMatch(migration, /RWTH Aachen University/i);
});
