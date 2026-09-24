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
  assert.match(programUpdate, /select\("university_id,/);
  assert.match(programUpdate, /application_url,source_url"\)/);
  assert.match(programUpdate, /if \(data\.university_id !== existing\.university_id\)/);
  assert.match(programUpdate, /from\("universities"\)/);
  assert.match(programUpdate, /Vous ne pouvez pas rattacher ce programme à une université inactive/);
});


test("material programme changes invalidate stale verification", () => {
  assert.match(programUpdate, /const verificationContentChanged =/);
  assert.match(programUpdate, /existing\.university_id !== data\.university_id/);
  assert.match(programUpdate, /normalizeText\(existing\.winter_deadline\) !== data\.winter_deadline/);
  assert.match(programUpdate, /normalizeText\(existing\.summer_deadline\) !== data\.summer_deadline/);
  assert.match(programUpdate, /existing\.degree_level !== data\.degree_level/);
  assert.match(programUpdate, /currentAverage !== nextAverage/);
  assert.match(programUpdate, /mark_verified === true \|\| !verificationContentChanged/);
});


test("material university changes invalidate stale verification", () => {
  assert.match(universityUpdate, /const verificationContentChanged =/);
  assert.match(universityUpdate, /existing\.name !== nextUniversity\.name/);
  assert.match(universityUpdate, /existing\.university_type !== nextUniversity\.university_type/);
  assert.match(universityUpdate, /existing\.is_public !== nextUniversity\.is_public/);
  assert.match(universityUpdate, /optionalText\(existing\.tuition_notes\) !== nextUniversity\.tuition_notes/);
  assert.match(universityUpdate, /mark_verified === true \|\| !verificationContentChanged/);
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


test("catalogue routes reject invalid enum values instead of silently inventing defaults", () => {
  assert.match(programCreate, /Choisissez un niveau de diplôme valide/);
  assert.match(programUpdate, /programValidationError\(body\)/);
  assert.match(universityCreate, /Choisissez un type d’établissement valide/);
  assert.match(universityUpdate, /Choisissez un type d’établissement valide/);
  assert.doesNotMatch(universityCreate, /\? body\.university_type : "Universität"/);
  assert.doesNotMatch(universityUpdate, /\? body\.university_type : "Universität"/);
});


test("programme routes validate dates and indicative averages before database writes", () => {
  assert.match(programCreate, /function programValidationError/);
  assert.match(programCreate, /Les échéances doivent être des dates valides/);
  assert.match(programCreate, /La moyenne indicative doit être un nombre valide/);
  assert.match(programCreate, /Number\.isFinite/);
  assert.match(programUpdate, /programValidationError\(body\)/);
  assert.doesNotMatch(programUpdate, /degreeLevels\.includes\(body\.degree_level/);
});


test("catalogue payloads normalize blank URLs and deadline whitespace", () => {
  assert.match(programCreate, /body\.winter_deadline\.trim\(\) \? body\.winter_deadline\.trim\(\) : null/);
  assert.match(programCreate, /body\.summer_deadline\.trim\(\) \? body\.summer_deadline\.trim\(\) : null/);
  assert.match(programCreate, /source_url: optionalText\(body\.source_url\)/);
  assert.match(programCreate, /application_url: optionalText\(body\.application_url \?\? body\.official_url\)/);
  assert.match(universityCreate, /const optionalText =/);
  assert.match(universityCreate, /website_url: websiteUrl/);
  assert.match(universityCreate, /source_url: sourceUrl/);
  assert.match(universityUpdate, /website_url: websiteUrl \|\| null/);
  assert.match(universityUpdate, /const optionalText =/);
});


test("catalogue routes reject malformed UUIDs before database access", () => {
  assert.match(programCreate, /isUuid\(data\.university_id\)/);
  assert.match(programUpdate, /isUuid\(id\)/);
  assert.match(programUpdate, /isUuid\(data\.university_id\)/);
  assert.match(universityUpdate, /isUuid\(id\)/);
  assert.match(programUpdate, /Identifiant de programme invalide/);
  assert.match(universityUpdate, /Identifiant d’université invalide/);
});


test("full catalogue updates also confirm that a target row still exists", () => {
  assert.match(
    programUpdate,
    /update\(\{ \.\.\.data, \.\.\.verificationPatch \}\)[\s\S]*\.select\("id"\)[\s\S]*\.maybeSingle\(\)/,
  );
  assert.match(
    universityUpdate,
    /from\("universities"\)\.update\([\s\S]*\.select\("id"\)\.maybeSingle\(\)/,
  );
  assert.match(programUpdate, /if \(!updated\).*Programme introuvable/);
  assert.match(universityUpdate, /if \(!updated\).*Université introuvable/);
});


test("full catalogue updates require explicit structural booleans", () => {
  assert.match(programUpdate, /"is_active", "studienkolleg_required", "testas_required", "uni_assist_required"/);
  assert.match(programUpdate, /Les choix structurants du programme doivent être explicitement définis/);
  assert.match(universityUpdate, /"is_active", "is_public"/);
  assert.match(universityUpdate, /Les états actif\/public de l’établissement doivent être explicitement définis/);
});


test("validated catalogue booleans are stored explicitly without fallback semantics", () => {
  assert.match(programCreate, /studienkolleg_required: body\.studienkolleg_required as boolean/);
  assert.match(programCreate, /testas_required: body\.testas_required as boolean/);
  assert.match(programCreate, /uni_assist_required: body\.uni_assist_required as boolean/);
  assert.match(programCreate, /is_active: body\.is_active as boolean/);
  assert.match(universityCreate, /is_public: body\.is_public as boolean/);
  assert.match(universityCreate, /is_active: body\.is_active as boolean/);
  assert.match(universityUpdate, /is_public: body\.is_public as boolean/);
  assert.match(universityUpdate, /is_active: body\.is_active as boolean/);
});


test("programme verification comparison handles null averages without false changes", () => {
  assert.match(programUpdate, /existing\.indicative_average == null \? null : Number/);
  assert.match(programUpdate, /data\.indicative_average == null \? null : Number/);
  assert.doesNotMatch(programUpdate, /indicative_average \?\? NaN/);
});


test("university verification ignores logo-only maintenance", () => {
  const comparisonBlock = universityUpdate.slice(
    universityUpdate.indexOf("const verificationContentChanged"),
    universityUpdate.indexOf("const verificationPatch"),
  );
  assert.doesNotMatch(comparisonBlock, /logo_url/);
});


test("optional programme academic fields normalize empty strings to null", () => {
  assert.match(programCreate, /const optionalText =/);
  for (const field of [
    "field",
    "duration",
    "nc_requirement",
    "german_level_required",
    "english_level_required",
    "diploma_required",
    "application_fee_notes",
    "almago_notes",
  ]) {
    assert.match(programCreate, new RegExp(field + ": optionalText"));
  }
  assert.match(programCreate, /teaching_language: optionalText\(body\.teaching_language \?\? body\.language\)/);
});


test("optional university fields normalize empty strings to null on create", () => {
  for (const field of ["city", "bundesland", "description", "tuition_notes"]) {
    assert.match(universityCreate, new RegExp(field + ": optionalText"));
  }
  assert.match(universityCreate, /logo_url: logoUrl/);
});


test("legacy blank catalogue values do not trigger false verification changes", () => {
  assert.match(programUpdate, /const normalizeText =/);
  assert.match(programUpdate, /normalizeText\(existing\.field\) !== data\.field/);
  assert.match(programUpdate, /normalizeText\(existing\.application_fee_notes\) !== data\.application_fee_notes/);
  assert.match(universityUpdate, /optionalText\(existing\.city\) !== nextUniversity\.city/);
  assert.match(universityUpdate, /optionalText\(existing\.description\) !== nextUniversity\.description/);
});


test("university logo URLs must be real http or https links", () => {
  for (const source of [universityCreate, universityUpdate]) {
    assert.match(source, /logoUrl/);
    assert.match(source, /logoUrl && !isHttpSourceUrl\(logoUrl\)/);
    assert.match(source, /Le lien du logo doit être une URL http\/https valide/);
  }
});
