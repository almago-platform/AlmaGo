import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const onboardingRoute = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");
const profileRoute = readFileSync("src/app/api/student/profile/route.ts", "utf8");
const onboardingPage = readFileSync("src/app/student/onboarding/page.tsx", "utf8");
const profileLib = readFileSync("src/lib/student/profile.ts", "utf8");
const profilePage = readFileSync("src/app/student/profile/page.tsx", "utf8");

test("completed onboarding records consent before persisting the completed profile", () => {
  assert.match(onboardingRoute, /input\.complete === true/);
  assert.match(onboardingRoute, /consentAccepted !== true/);
  assert.match(onboardingRoute, /update\.onboarding_completed = true/);
  assert.match(onboardingRoute, /update\.onboarding_completed_at = new Date\(\)\.toISOString\(\)/);

  const consentIndex = onboardingRoute.indexOf('.from("consents")');
  const profileWriteIndex = onboardingRoute.indexOf('.from("profiles")\n    .upsert');
  assert.ok(consentIndex >= 0);
  assert.ok(profileWriteIndex > consentIndex);
});

test("partial name edits preserve the untouched half of full_name", () => {
  assert.match(profileRoute, /hasOwnProperty\.call\(update, "first_name"\)/);
  assert.match(profileRoute, /hasOwnProperty\.call\(update, "last_name"\)/);
  assert.match(profileRoute, /select\("first_name,last_name"\)/);
  assert.match(profileRoute, /hasFirstName \? update\.first_name : currentProfile\?\.first_name/);
  assert.match(profileRoute, /hasLastName \? update\.last_name : currentProfile\?\.last_name/);
  assert.match(profileRoute, /update\.full_name = fullName \|\| null/);
});

test("onboarding page loads only fields needed by the form", () => {
  assert.doesNotMatch(onboardingPage, /select\("\*"\)/);
  assert.match(onboardingPage, /first_name,last_name,birth_date,nationality/);
  assert.match(onboardingPage, /target_degree,target_field,study_language,target_intake/);
  assert.match(onboardingPage, /preferred_cities,budget_range,onboarding_completed/);
});


test("explicit onboarding consent clears an earlier revocation", () => {
  assert.match(onboardingRoute, /const consentedAt = new Date\(\)\.toISOString\(\)/);
  assert.match(onboardingRoute, /granted_at: consentedAt/);
  assert.match(onboardingRoute, /revoked_at: null/);
  assert.match(onboardingRoute, /onConflict: "user_id,consent_type,policy_version"/);
});


test("birth date validation rejects impossible calendar dates", () => {
  assert.match(profileLib, /function isValidDateOnly/);
  assert.match(profileLib, /Date\.UTC\(year, month - 1, day\)/);
  assert.match(profileLib, /candidate\.getUTCFullYear\(\) === year/);
  assert.match(profileLib, /La date de naissance doit être une date valide/);
});


test("onboarding load failures never fall through to an empty editable form", () => {
  assert.match(onboardingPage, /error: profileError/);
  assert.match(onboardingPage, /if \(profileError\)/);
  assert.match(onboardingPage, /Profil temporairement indisponible/);
  assert.match(onboardingPage, /Réessayez avant de saisir de nouvelles données/);
});


test("profile page loads only fields used by the form", () => {
  assert.doesNotMatch(profilePage, /select\("\*"\)/);
  assert.match(profilePage, /first_name,last_name,birth_date,nationality/);
  assert.match(profilePage, /target_degree,target_field,study_language,target_intake/);
  assert.match(profilePage, /preferred_cities,budget_range,onboarding_completed/);
});
