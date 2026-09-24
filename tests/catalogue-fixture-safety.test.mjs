import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isKnownCatalogueFixtureName } from "../src/lib/source-verification.ts";

const universityCreate = readFileSync("src/app/api/admin/universities/route.ts", "utf8");
const universityEdit = readFileSync("src/app/api/admin/universities/[id]/route.ts", "utf8");
const programCreate = readFileSync("src/app/api/admin/programs/route.ts", "utf8");

test("known historical catalogue fixtures are rejected by name", () => {
  assert.equal(isKnownCatalogueFixtureName("AlmaGo Test University 1790008696299"), true);
  assert.equal(isKnownCatalogueFixtureName("  almago   test   program 123  "), true);
  assert.equal(isKnownCatalogueFixtureName("aa"), true);
  assert.equal(isKnownCatalogueFixtureName("RWTH Aachen University"), false);
  assert.equal(isKnownCatalogueFixtureName("Artificial Intelligence"), false);
});

test("university create and edit routes enforce the fixture-name guard", () => {
  assert.match(universityCreate, /isKnownCatalogueFixtureName\(body\.name\)/);
  assert.match(universityEdit, /isKnownCatalogueFixtureName\(body\.name\)/);
  assert.match(universityCreate, /donnée de test connue/);
  assert.match(universityEdit, /donnée de test connue/);
});

test("program validation enforces the fixture-name guard for create and full edit", () => {
  assert.match(programCreate, /isKnownCatalogueFixtureName\(body\.name\)/);
  assert.match(programCreate, /export \{ payload as programPayload, programValidationError \}/);
});

test("quick active-state patches remain available for protected production cleanup", () => {
  assert.match(universityEdit, /const isActiveOnlyPatch/);
  const programEdit = readFileSync("src/app/api/admin/programs/[id]/route.ts", "utf8");
  assert.match(programEdit, /const isActiveOnlyPatch/);
});
