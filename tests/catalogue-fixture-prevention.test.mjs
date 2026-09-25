import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const universitiesRoute = readFileSync("src/app/api/admin/universities/route.ts", "utf8");
const programsRoute = readFileSync("src/app/api/admin/programs/route.ts", "utf8");
const universitiesPanel = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");
const programsPanel = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");
const authenticatedE2E = readFileSync("tests/e2e/authenticated.spec.mjs", "utf8");
const adminQualityE2E = readFileSync("tests/e2e/admin-space-quality.spec.mjs", "utf8");

test("new catalogue records are created inactive at the API boundary", () => {
  assert.match(
    universitiesRoute,
    /New catalogue records always start inactive[\s\S]*is_active: false/,
  );
  assert.match(programsRoute, /const data = \{ \.\.\.payload\(body\), is_active: false \};/);
});

test("new catalogue forms also default to inactive", () => {
  assert.match(universitiesPanel, /const empty: UniversityForm = \{[\s\S]*is_active: false,[\s\S]*\};/);
  assert.match(programsPanel, /const empty: ProgramForm = \{[\s\S]*is_active: false,[\s\S]*\};/);
  assert.match(universitiesPanel, /ajoutée au catalogue en état inactif/);
  assert.match(programsPanel, /ajouté au catalogue en état inactif/);
});

test("known catalogue fixtures remain rejected", () => {
  assert.match(universitiesRoute, /isKnownCatalogueFixtureName\(body\.name\)/);
  assert.match(programsRoute, /isKnownCatalogueFixtureName\(body\.name\)/);
});

test("authenticated E2E catalogue coverage stays read-only", () => {
  for (const source of [authenticatedE2E, adminQualityE2E]) {
    assert.doesNotMatch(
      source,
      /page\.request\.post\(["'`]\/api\/admin\/(?:universities|programs)/,
    );
    assert.doesNotMatch(
      source,
      /fetch\(["'`]\/api\/admin\/(?:universities|programs)/,
    );
  }

  assert.match(adminQualityE2E, /path: "\/admin\/universities"/);
  assert.match(adminQualityE2E, /path: "\/admin\/programs"/);
});

test("catalogue fixture prevention does not delete records", () => {
  for (const source of [universitiesRoute, programsRoute]) {
    assert.doesNotMatch(source, /\.delete\(\)/);
  }
});
