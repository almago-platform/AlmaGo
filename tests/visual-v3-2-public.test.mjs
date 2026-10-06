import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const home = read("src/app/page.tsx");
const login = read("src/app/login/page.tsx");
const signup = read("src/app/signup/page.tsx");
const resetPage = read("src/app/reset-password/page.tsx");
const resetForm = read("src/components/auth/ResetPasswordForm.tsx");
const authForm = read("src/components/auth/AuthForm.tsx");
const authStory = read("src/components/auth/AuthStoryPanel.tsx");
const orientation = read("src/components/orientation/PublicOrientationForm.tsx");
const orientationLoading = read("src/app/orientation/loading.tsx");
const notFound = read("src/app/not-found.tsx");
const errorPage = read("src/app/error.tsx");
const contact = read("src/app/contact/page.tsx");
const logo = read("src/components/brand/BrandLogo.tsx");

test("Public V3.2 preserves the approved homepage composition and Phase 2 entry", () => {
  for (const component of [
    "HomeHeader",
    "HomeHero",
    "HomeQuickAccess",
    "HomeProductPreview",
    "HomePhotoBand",
    "HomeJourneySection",
    "HomeTrustSection",
    "HomeFaqSection",
    "HomeFinalCta",
    "HomeFooter",
  ]) {
    assert.match(home, new RegExp(component));
  }
  assert.match(home, /phase2Enabled \? "\/orientation" : "\/signup"/);
});

test("Public V3.2 premiumizes auth surfaces while preserving hydration and Supabase auth", () => {
  assert.match(authStory, /auth-story-panel pc-panel/);
  assert.match(authStory, /pc-soft-strip/);
  assert.match(authForm, /auth-form-card pc-panel/);
  assert.match(authForm, /pc-soft-strip/);
  assert.match(authForm, /data-auth-ready=\{hydrated \? "true" : "false"\}/);
  assert.match(authForm, /supabase\.auth\.signUp/);
  assert.match(authForm, /supabase\.auth\.signInWithPassword/);
  assert.match(authForm, /supabase\.auth\.resetPasswordForEmail/);
  assert.match(login, /auth-page-grid/);
  assert.match(signup, /auth-page-grid/);
  assert.match(login, /linear-gradient/);
  assert.match(signup, /linear-gradient/);
});

test("Public V3.2 premiumizes password recovery without changing reset behavior", () => {
  assert.match(resetPage, /pc-panel/);
  assert.match(resetForm, /pc-panel/);
  assert.match(resetForm, /pc-soft-strip/);
  assert.match(resetForm, /createClient\(\)\.auth\.updateUser/);
  assert.match(resetForm, /orientation\/claim/);
  assert.match(resetForm, /minLength=\{8\}/);
});

test("Public V3.2 premiumizes orientation without changing browser-only questionnaire truth", () => {
  assert.match(orientation, /orientation-print-page/);
  assert.match(orientation, /professional-panel pc-panel/);
  assert.match(orientation, /orientation-tone-actions pc-panel/);
  assert.match(orientation, /buttonClassName/);
  assert.match(orientation, /sessionStorage/);
  assert.match(orientation, /PUBLIC_ORIENTATION_SESSION_KEY as SESSION_KEY/);
  assert.doesNotMatch(orientation, /fetch\s*\(/);
  assert.doesNotMatch(orientation, /supabase/i);
  assert.match(orientation, /role="progressbar"/);
  assert.match(orientation, /CandidateOrientationResultHeader/);
  assert.match(orientation, /OrientationOnePagePrintReport/);
});

test("Public V3.2 keeps the localized accessible orientation loading contract", () => {
  assert.match(orientationLoading, /pc-panel/);
  assert.match(orientationLoading, /aria-busy="true"/);
  assert.match(orientationLoading, /role="status"/);
  assert.match(orientationLoading, /aria-live="polite"/);
  assert.match(orientationLoading, /orientationCopy\[locale\]/);
});

test("Public V3.2 premiumizes recovery states without weakening safe navigation", () => {
  assert.match(notFound, /pc-panel/);
  assert.match(notFound, /<ButtonLink href="\/">\{t\.home\}<\/ButtonLink>/);
  assert.match(notFound, /<ButtonLink href="\/contact" variant="secondary">\{t\.contact\}<\/ButtonLink>/);
  assert.match(errorPage, /pc-panel/);
  assert.match(errorPage, /onClick=\{reset\}/);
  assert.match(errorPage, /<ButtonLink href="\/" variant="secondary">\{t\.home\}<\/ButtonLink>/);
  assert.doesNotMatch(errorPage, /error\.message|error\.stack|error\.digest|digest\}/);
});

test("Public V3.2 preserves the confirmed public contact and approved brand", () => {
  assert.match(contact, /contact@campus-allemagne\.info/);
  assert.match(contact, /new URL\("\/contact", publicOrigin\)/);
  assert.match(contact, /HomeFooter/);
  assert.match(contact, /BrandLogo/);
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
