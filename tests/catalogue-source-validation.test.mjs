import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { isHttpSourceUrl, sourceUrlsChanged } from "../src/lib/source-verification.ts";

const programCreate = readFileSync("src/app/api/admin/programs/route.ts", "utf8");
const programUpdate = readFileSync("src/app/api/admin/programs/[id]/route.ts", "utf8");
const universityCreate = readFileSync("src/app/api/admin/universities/route.ts", "utf8");
const universityUpdate = readFileSync("src/app/api/admin/universities/[id]/route.ts", "utf8");
const programAdminPanel = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");
const programAdminPage = readFileSync("src/app/admin/programs/page.tsx", "utf8");
const universityAdminPanel = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");

test("catalogue source helper rejects placeholder and executable schemes", () => {
  for (const value of ["a", "example.edu/programme", "javascript:alert(1)", "data:text/html,test", "ftp://example.edu"]) {
    assert.equal(isHttpSourceUrl(value), false, value);
  }
  assert.equal(isHttpSourceUrl("https://example.edu/programme"), true);
  assert.equal(isHttpSourceUrl("http://example.edu/programme"), true);
});

test("source change detection normalizes blanks but invalidates a genuinely changed source", () => {
  assert.equal(sourceUrlsChanged([null, ""], ["", null]), false);
  assert.equal(
    sourceUrlsChanged(
      ["https://example.edu/programme", null],
      ["https://example.edu/programme", ""],
    ),
    false,
  );
  assert.equal(
    sourceUrlsChanged(
      ["https://example.edu/programme", null],
      ["https://example.edu/programme-2027", null],
    ),
    true,
  );
});

test("programme create and update routes reject malformed non-empty official links", () => {
  for (const source of [programCreate, programUpdate]) {
    assert.match(source, /const programmeUrls =/);
    assert.match(source, /programmeUrls\.some\(\(value\) => !isHttpSourceUrl\(value\)\)/);
    assert.match(source, /Les liens de source et de candidature doivent être des URL http\/https valides/);
    assert.match(source, /mark_verified === true/);
  }
});

test("university create and update routes reject malformed non-empty official links", () => {
  for (const source of [universityCreate, universityUpdate]) {
    assert.match(source, /const universityUrls =/);
    assert.match(source, /universityUrls\.some\(\(value\) => !isHttpSourceUrl\(value\)\)/);
    assert.match(source, /Les liens du site et de la source doivent être des URL http\/https valides/);
    assert.match(source, /mark_verified === true/);
  }
});

test("catalogue validation does not introduce privileged credentials", () => {
  for (const source of [programCreate, programUpdate, universityCreate, universityUpdate]) {
    assert.doesNotMatch(source, /service_role|SUPABASE_SECRET|secret key/i);
  }
});


test("catalogue update routes invalidate stale verification dates when source evidence changes", () => {
  for (const source of [programUpdate, universityUpdate]) {
    assert.match(source, /sourceUrlsChanged/);
    assert.match(source, /sourceChanged/);
    assert.match(source, /verified_at: null/);
  }
});

test("programme active-state toggle stays partial and can quarantine malformed legacy entries", () => {
  assert.match(programUpdate, /typeof body\.is_active === "boolean"/);
  assert.match(programUpdate, /Object\.keys\(body\)\.every\(\(key\) => key === "is_active"\)/);
  assert.match(programUpdate, /\.update\(\{ is_active: body\.is_active \}\)/);
  assert.match(programUpdate, /Impossible de modifier l’état du programme/);
  assert.match(programAdminPanel, /body: JSON\.stringify\(\{ is_active: !program\.is_active \}\)/);
  assert.match(programAdminPanel, /Désactiver/);
  assert.match(programAdminPanel, /Réactiver/);
});

test("university active-state toggle stays partial and does not overwrite catalogue fields", () => {
  assert.match(universityUpdate, /typeof body\.is_active === "boolean"/);
  assert.match(universityUpdate, /Object\.keys\(body\)\.every\(\(key\) => key === "is_active"\)/);
  assert.match(universityUpdate, /\.update\(\{ is_active: body\.is_active \}\)/);
  assert.match(universityUpdate, /Impossible de modifier l’état de l’université/);
});


test("programme admin preserves inactive university context without allowing new inactive assignments", () => {
  assert.match(programAdminPage, /universities\(name,city,is_active\)/);
  assert.match(programAdminPage, /select\("id,name,is_active"\)/);
  assert.doesNotMatch(programAdminPage, /select\("id,name"\)\.eq\("is_active", true\)/);
  assert.match(programAdminPage, /activeUniversities = universityRows\.filter/);
  assert.match(programAdminPanel, /disabled=\{!university\.is_active && university\.id !== form\.university_id\}/);
  assert.match(programAdminPanel, /Université inactive · non publiable/);
});


test("programme admin quality summary counts only genuinely publishable programmes", () => {
  assert.match(programAdminPanel, /const publishablePrograms = items\.filter\(isPublishableProgram\)/);
  assert.match(programAdminPanel, /title="Programmes publiables"/);
  assert.match(programAdminPanel, /Programme actif, université active et source vérifiée/);
});


test("programme create requires an active university server-side", () => {
  assert.match(programCreate, /from\("universities"\)/);
  assert.match(programCreate, /select\("id,is_active"\)/);
  assert.match(programCreate, /!targetUniversity\?\.is_active/);
  assert.match(programCreate, /Choisissez une université active avant de créer ce programme/);
});

test("programme update blocks reassignment to an inactive university but preserves historical parent edits", () => {
  assert.match(programUpdate, /source_url,application_url,university_id/);
  assert.match(programUpdate, /if \(data\.university_id !== existing\.university_id\)/);
  assert.match(programUpdate, /from\("universities"\)/);
  assert.match(programUpdate, /Vous ne pouvez pas rattacher ce programme à une université inactive/);
});


test("programme university reassignment invalidates stale verification", () => {
  assert.match(programUpdate, /const universityChanged = data\.university_id !== existing\.university_id/);
  assert.match(programUpdate, /const verificationEvidenceChanged = sourceChanged \|\| universityChanged/);
  assert.match(programUpdate, /mark_verified === true \|\| !verificationEvidenceChanged/);
});


test("university source changes still invalidate stale verification", () => {
  assert.match(universityUpdate, /mark_verified === true \|\| !sourceChanged/);
});


test("university admin explains the publication impact of activation state", () => {
  assert.match(universityAdminPanel, /rend ses programmes non publiables dans les nouvelles pistes d’orientation/);
  assert.match(universityAdminPanel, /ses programmes ne peuvent pas être proposés dans une nouvelle piste d’orientation/);
  assert.match(universityAdminPanel, /réactiver peut rendre de nouveau publiables/);
});


test("programme quality filter exposes inactive parent universities", () => {
  assert.match(programAdminPanel, /inactiveUniversityCount/);
  assert.match(programAdminPanel, /quality === "inactive_university"/);
  assert.match(programAdminPanel, /option value="inactive_university"/);
  assert.match(programAdminPanel, /title="Université inactive"/);
  assert.match(programAdminPanel, /Programmes actifs actuellement non publiables/);
});


test("activation-only catalogue patches return 404 when the target no longer exists", () => {
  assert.match(programUpdate, /\.select\("id"\)\s*\.maybeSingle\(\)/);
  assert.match(programUpdate, /if \(!updated\).*Programme introuvable/);
  assert.match(universityUpdate, /\.select\("id"\)\s*\.maybeSingle\(\)/);
  assert.match(universityUpdate, /if \(!updated\).*Université introuvable/);
});
