import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/0024_real_germany_university_program_catalog_2026_09_26.sql", "utf8");

test("real catalogue seeds only named real universities with official domains", () => {
  for (const university of [
    "RWTH Aachen University",
    "Technische Universität Berlin",
    "Technical University of Munich",
    "Saarland University",
  ]) assert.match(migration, new RegExp(university));

  for (const domain of ["rwth-aachen.de", "tu.berlin", "tum.de", "uni-saarland.de"]) {
    assert.match(migration, new RegExp(domain.replace(".", "\\.")));
  }
  assert.doesNotMatch(migration, /AlmaGo Test University|AlmaGo Test Program/);
});

test("catalogue includes both bachelor and master programmes without ranking language", () => {
  assert.match(migration, /'Master'/);
  assert.match(migration, /'Bachelor'/);
  assert.match(migration, /Computer Engineering/);
  assert.match(migration, /Computer Science \(Informatik\)/);
  assert.match(migration, /Computer Science \(English\)/);
  assert.doesNotMatch(migration, /best university|top choice|recommended for you|guaranteed admission|admission probability/i);
});

test("unknown facts are preserved as unknown rather than fabricated", () => {
  assert.match(migration, /Unknown or institution-dependent values remain NULL/);
  assert.match(migration, /duration,diploma_required,almago_notes/);
  assert.match(migration, /'2026-09-26'/);
});
