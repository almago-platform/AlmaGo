import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const createRoute = readFileSync("src/app/api/admin/programs/route.ts", "utf8");
const updateRoute = readFileSync("src/app/api/admin/programs/[id]/route.ts", "utf8");
const adminPanel = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");
const studentPanel = readFileSync("src/components/student/StudentOrientationPanel.tsx", "utf8");
const orientationPage = readFileSync("src/app/student/orientation/page.tsx", "utf8");

test("programme verification date changes only after explicit admin confirmation", () => {
  assert.match(createRoute, /body\.mark_verified === true/);
  assert.match(createRoute, /verified_at: new Date\(\)\.toISOString\(\)/);
  assert.match(adminPanel, /J’ai vérifié les informations auprès de cette source aujourd’hui/);
  assert.match(adminPanel, /mark_verified: false/);
});

test("programme verification requires an official source", () => {
  assert.match(createRoute, /Ajoutez une source officielle avant de confirmer la vérification/);
  assert.match(updateRoute, /Ajoutez une source officielle avant de confirmer la vérification/);
});

test("student orientation exposes real source and verification metadata", () => {
  assert.match(orientationPage, /source_url,verified_at/);
  assert.match(studentPanel, /source_url: string \| null/);
  assert.match(studentPanel, /verified_at: string \| null/);
  assert.match(studentPanel, /Date de vérification non enregistrée/);
  assert.match(studentPanel, /Vérifié dans AlmaGo le/);
});

test("admin catalogue can find missing verification evidence", () => {
  assert.match(adminPanel, /Vérification à compléter/);
  assert.match(adminPanel, /missing_verification/);
  assert.match(adminPanel, /missingVerificationCount/);
});
