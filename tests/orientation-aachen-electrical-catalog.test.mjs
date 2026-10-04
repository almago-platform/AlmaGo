import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261004153500_orientation_aachen_electrical_catalog.sql",
  "utf8",
);

test("Aachen electrical catalogue migration publishes the verified RWTH Bachelor", () => {
  assert.match(migration, /RWTH Aachen University/);
  assert.match(migration, /Elektrotechnik und Informationstechnik/);
  assert.match(migration, /'Bachelor'/);
  assert.match(migration, /'Electrical Engineering'/);
  assert.match(migration, /'German'/);
  assert.match(migration, /registry_status = 'verified_catalogue'/);
  assert.match(migration, /host:rwth-aachen\.de/);
});

test("Aachen electrical catalogue migration publishes one canonical FH Aachen Bachelor", () => {
  assert.match(migration, /'FH Aachen'/);
  assert.match(migration, /FH Aachen – University of Applied Sciences/);
  assert.match(migration, /host:fh-aachen\.de/);
  assert.match(migration, /'Elektrotechnik'/);
  assert.match(migration, /'Electrical Engineering'/);
});

test("Aachen electrical catalogue migration relinks legacy FH discovery aliases without deleting cache rows", () => {
  assert.match(migration, /update public\.orientation_research_programs/);
  assert.match(migration, /set university_id = fh_aachen_id/);
  assert.match(migration, /fh aachen – university of applied sciences/);
  assert.match(migration, /https:\/\/www\.fh-aachen\.de\/%/);
  assert.doesNotMatch(migration, /delete from public\.orientation_research_programs/i);
});
