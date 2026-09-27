import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const login = readFileSync("src/app/login/page.tsx", "utf8");
const signup = readFileSync("src/app/signup/page.tsx", "utf8");
const authForm = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const progress = readFileSync("src/components/student/StudentEntryProgress.tsx", "utf8");
const onboarding = readFileSync("src/app/student/onboarding/page.tsx", "utf8");
const onboardingForm = readFileSync("src/components/student/OnboardingForm.tsx", "utf8");
const profile = readFileSync("src/app/student/profile/page.tsx", "utf8");
const profileForm = readFileSync("src/components/student/ProfileForm.tsx", "utf8");

test("login and signup now share the same professional auth composition", () => {
  for (const source of [login, signup]) {
    assert.match(source, /linear-gradient/);
    assert.match(source, /max-w-7xl/);
    assert.match(source, /max-w-\[36rem\]/);
    assert.match(source, /AuthStoryPanel/);
  }
});

test("entry progress explicitly connects account, dossier and student space", () => {
  assert.match(progress, /Compte/);
  assert.match(progress, /Dossier initial/);
  assert.match(progress, /Espace étudiant/);
  assert.match(progress, /aria-label="Progression de création du dossier"/);
  assert.match(authForm, /StudentEntryProgress current=\{1\} compact/);
  assert.match(onboarding, /StudentEntryProgress current=\{2\} compact/);
  assert.match(profile, /StudentEntryProgress current=\{3\} compact/);
});

test("onboarding keeps the existing five internal steps and save behavior", () => {
  assert.match(onboardingForm, /title: "Identité"/);
  assert.match(onboardingForm, /title: "Validation"/);
  assert.match(onboardingForm, /fetch\("\/api\/student\/onboarding"/);
  assert.match(onboardingForm, /if \(nextStep === 6\) router\.push\("\/student"\)/);
});

test("onboarding load errors fail visibly without changing data", () => {
  assert.match(onboarding, /profileError/);
  assert.match(onboarding, /OnboardingUnavailable/);
  assert.match(onboarding, /Aucune donnée n’a été modifiée/);
  assert.match(onboarding, /href="\/student\/onboarding"/);
});

test("profile remains editable through the same API and returns directly to the dossier", () => {
  assert.match(profileForm, /fetch\("\/api\/student\/profile"/);
  assert.match(profile, /Retour à mon dossier/);
  assert.match(profile, /profileCompletion/);
  assert.match(profile, /max-w-7xl px-4 py-5/);
});
