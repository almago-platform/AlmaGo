import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const createRoute = readFileSync("src/app/api/admin/universities/route.ts", "utf8");
const updateRoute = readFileSync("src/app/api/admin/universities/[id]/route.ts", "utf8");
const adminPanel = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");

test("university verification date requires explicit admin confirmation", () => {
  assert.match(createRoute, /body\.mark_verified === true/);
  assert.match(createRoute, /verified_at: new Date\(\)\.toISOString\(\)/);
  assert.match(adminPanel, /J’ai vérifié les informations auprès de cette source aujourd’hui/);
  assert.match(adminPanel, /mark_verified: false/);
});

test("university verification cannot be confirmed without an official source", () => {
  assert.match(createRoute, /Ajoutez une URL officielle valide/);
  assert.match(updateRoute, /Ajoutez une URL officielle valide/);
});

test("university catalogue surfaces source and verification gaps", () => {
  assert.match(adminPanel, /Source officielle à compléter/);
  assert.match(adminPanel, /Vérification à compléter/);
  assert.match(adminPanel, /missingVerificationCount/);
  assert.match(adminPanel, /missing_verification/);
});
