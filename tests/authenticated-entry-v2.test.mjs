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
    assert.ok(source.includes("linear-gradient"));
    assert.ok(source.includes("max-w-7xl"));
    assert.ok(source.includes("max-w-[36rem]"));
    assert.ok(source.includes("AuthStoryPanel"));
  }
});

test("entry progress explicitly connects account, dossier and student space", () => {
  assert.ok(progress.includes('["Compte", "Créer votre accès"]'));
  assert.ok(progress.includes('["Dossier initial", "Renseigner votre profil"]'));
  assert.ok(progress.includes('["Espace étudiant", "Suivre votre parcours"]'));
  assert.ok(progress.includes('aria: "Progression de création du dossier"'));
  assert.ok(progress.includes("ar: {"));
  assert.ok(progress.includes("en: {"));
  assert.ok(progress.includes("de: {"));
  assert.ok(authForm.includes("<StudentEntryProgress current={1} compact />"));
  assert.ok(onboarding.includes("<StudentEntryProgress current={2} compact />"));
  assert.ok(profile.includes("<StudentEntryProgress current={3} compact />"));
});

test("onboarding keeps the existing five internal steps and save behavior", () => {
  assert.ok(onboardingForm.includes('title: "Identité"'));
  assert.ok(onboardingForm.includes('title: "Validation"'));
  assert.ok(onboardingForm.includes('fetch("/api/student/onboarding"'));
  assert.ok(onboardingForm.includes('if (nextStep === 6) router.push("/student")'));
});

test("onboarding load errors fail visibly without changing data", () => {
  assert.ok(onboarding.includes("profileError"));
  assert.ok(onboarding.includes("OnboardingUnavailable"));
  assert.ok(onboarding.includes("Aucune donnée n’a été modifiée"));
  assert.ok(onboarding.includes('href="/student/onboarding"'));
});

test("profile remains editable through the same API and returns directly to the dossier", () => {
  assert.ok(profileForm.includes('fetch("/api/student/profile"'));
  assert.ok(profile.includes("Retour à mon dossier"));
  assert.ok(profile.includes("profileCompletion"));
  assert.ok(profile.includes("max-w-7xl px-4 py-5"));
});
