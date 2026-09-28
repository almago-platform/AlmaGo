import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/onboarding/page.tsx", "utf8");
const form = readFileSync("src/components/student/OnboardingForm.tsx", "utf8");
const api = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");

test("onboarding keeps authenticated entry and completion redirect contract", () => {
  assert.match(page, /if \(!user\) redirect\("\/login"\)/);
  assert.match(page, /if \(profile\?\.onboarding_completed\) redirect\("\/student"\)/);
  assert.match(form, /if \(nextStep === 6\) router\.push\("\/student"\)/);
});

test("onboarding preserves the same five-step profile data contract", () => {
  assert.match(form, /title: "Identité"/);
  assert.match(form, /title: "Parcours"/);
  assert.match(form, /title: "Langues"/);
  assert.match(form, /title: "Projet"/);
  assert.match(form, /title: "Validation"/);
  assert.match(form, /first_name/);
  assert.match(form, /last_diploma/);
  assert.match(form, /german_level/);
  assert.match(form, /target_degree/);
  assert.match(form, /preferred_cities/);
});

test("onboarding preserves save API and completion consent behavior", () => {
  assert.match(form, /fetch\("\/api\/student\/onboarding"/);
  assert.match(form, /complete: nextStep === 6/);
  assert.match(form, /consentAccepted: consent/);
  assert.match(api, /input\.complete === true/);
  assert.match(api, /input\.consentAccepted !== true/);
  assert.match(api, /complete_student_onboarding/);
});

test("onboarding V2 provides premium guidance and mobile-friendly actions", () => {
  assert.match(page, /Configuration du dossier/);
  assert.match(form, /Commencez par votre projet/);
  assert.match(form, /mobile-nav-scroll/);
  assert.match(form, /w-full sm:w-auto/);
  assert.match(form, /Confirmer et ouvrir mon espace/);
  assert.match(form, /7973208/);
});

test("onboarding required fields remain unchanged", () => {
  assert.match(form, /1: \["first_name", "last_name", "nationality"\]/);
  assert.match(form, /4: \["target_degree", "target_field", "study_language", "target_intake"\]/);
});
