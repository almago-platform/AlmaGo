import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/onboarding/page.tsx", "utf8");
const form = readFileSync("src/components/student/OnboardingForm.tsx", "utf8");
const copy = readFileSync("src/content/student-onboarding-copy.ts", "utf8");
const api = readFileSync("src/app/api/student/onboarding/route.ts", "utf8");

test("onboarding keeps authenticated entry and completion redirect contract", () => {
  assert.ok(page.includes('if (!user) redirect("/login")'));
  assert.ok(page.includes('if (profile?.onboarding_completed) redirect("/student")'));
  assert.ok(form.includes('if (nextStep === 6) router.push("/student")'));
});

test("onboarding preserves the same five-step profile data contract", () => {
  for (const title of ["Identité", "Parcours", "Langues", "Projet", "Validation"]) {
    assert.ok(copy.includes(`title: "${title}"`));
  }
  for (const field of ["first_name", "last_diploma", "german_level", "target_degree", "preferred_cities"]) {
    assert.ok(form.includes(field));
  }
});

test("onboarding preserves save API and completion consent behavior", () => {
  assert.ok(form.includes('fetch("/api/student/onboarding"'));
  assert.ok(form.includes("complete: nextStep === 6"));
  assert.ok(form.includes("consentAccepted: consent"));
  assert.ok(api.includes("input.complete === true"));
  assert.ok(api.includes("input.consentAccepted !== true"));
  assert.ok(api.includes("complete_student_onboarding"));
});

test("onboarding V2 provides localized premium guidance and mobile-friendly actions", () => {
  assert.ok(copy.includes('eyebrow: "Configuration du dossier"'));
  assert.ok(copy.includes('dossierTitle: "Commencez par votre projet."'));
  assert.ok(form.includes("mobile-nav-scroll"));
  assert.ok(form.includes("w-full sm:w-auto"));
  assert.ok(form.includes("t.finish"));
  assert.ok(form.includes("7973208"));
  assert.ok(copy.includes("أكّد وافتح ملفك"));
  assert.ok(copy.includes("Confirm and open my space"));
  assert.ok(copy.includes("Bestätigen und Bereich öffnen"));
});

test("onboarding required fields remain unchanged", () => {
  assert.ok(form.includes('1: ["first_name", "last_name", "nationality"]'));
  assert.ok(form.includes('4: ["target_degree", "target_field", "study_language", "target_intake"]'));
});
