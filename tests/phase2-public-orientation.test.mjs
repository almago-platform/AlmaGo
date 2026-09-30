import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const page = read("src/app/orientation/page.tsx");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const publicOrientation = read("src/lib/orientation/public.ts");
const copy = read("src/content/orientation-copy.ts");
const home = read("src/app/page.tsx");
const hero = read("src/components/public/HomeHero.tsx");
const nativeCopy = read("src/content/native-copy.ts");
const sitemap = read("src/app/sitemap.ts");
const env = read(".env.example");

test("public orientation is feature-gated and does not alter the current homepage when disabled", () => {
  assert.match(page, /isPhase2AccessEnabled\(\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(home, /phase2Enabled \? "\/orientation" : "\/signup"/);
  assert.match(hero, /primaryHref/);
  assert.match(env, /ALMAGO_PHASE2_ENABLED=false/);
});

test("orientation keeps P2.1 questionnaire state browser-only", () => {
  assert.match(form, /sessionStorage/);
  assert.match(form, /PUBLIC_ORIENTATION_SESSION_KEY as SESSION_KEY/);
  assert.match(publicOrientation, /PUBLIC_ORIENTATION_SESSION_KEY = "almago_phase2_orientation_v1"/);
  assert.doesNotMatch(form, /fetch\s*\(/);
  assert.doesNotMatch(form, /supabase/i);
  assert.match(form, /prospectCaptureEnabled\s*\?\s*\([\s\S]*<ProspectCaptureCard/);
});

test("orientation reuses the existing controlled profile option sets", () => {
  for (const name of [
    "tunisianBacTrackOptions",
    "diplomaOptions",
    "degreeOptions",
    "studyFieldOptions",
    "languageLevelOptions",
    "studyLanguageOptions",
    "budgetOptions",
    "preferredCityOptions",
  ]) {
    assert.match(form, new RegExp(name));
  }
  assert.match(form, /localizeProfileOptions/);
});

test("orientation has progressive, labelled and keyboard-friendly structure", () => {
  assert.match(form, /role="progressbar"/);
  assert.match(form, /<fieldset>/);
  assert.match(form, /<legend/);
  assert.match(form, /role="alert"/);
  assert.match(form, /tabIndex=\{-1\}/);
  assert.match(form, /type="submit"/);
});

test("orientation provides native copy for all supported locales", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: OrientationCopy`));
  }
  assert.match(nativeCopy, /orientationPrimary: "Faire mon orientation gratuite"/);
  assert.match(nativeCopy, /orientationPrimary: "ابدأ توجيهي المجاني"/);
  assert.match(nativeCopy, /orientationPrimary: "Start my free orientation"/);
  assert.match(nativeCopy, /orientationPrimary: "Kostenlose Orientierung starten"/);
});

test("orientation is added to the sitemap only when Phase 2 is enabled", () => {
  assert.match(sitemap, /isPhase2AccessEnabled\(\)/);
  assert.match(sitemap, /new URL\("\/orientation", publicOrigin\)/);
});
