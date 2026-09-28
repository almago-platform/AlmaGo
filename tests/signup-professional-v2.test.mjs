import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const signup = readFileSync("src/app/signup/page.tsx", "utf8");
const form = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const story = readFileSync("src/components/auth/AuthStoryPanel.tsx", "utf8");
const mobileHeader = readFileSync("src/components/auth/AuthMobileHeader.tsx", "utf8");
const progress = readFileSync("src/components/student/StudentEntryProgress.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");

test("signup page uses the new student registration composition", () => {
  assert.match(signup, /AuthStoryPanel mode="signup"/);
  assert.match(signup, /linear-gradient/);
  assert.match(form, /StudentEntryProgress current={1} compact/);
  assert.match(progress, /Progression de création du dossier/);
  assert.match(signup, /max-w-[36rem]/);
});

test("signup story communicates the three-step account-to-dossier path", () => {
  assert.match(nativeCopy, /"Créer votre compte"/);
  assert.match(nativeCopy, /"Définir votre projet"/);
  assert.match(nativeCopy, /"Préparer votre dossier"/);
  assert.match(story, /7973208/);
  assert.match(nativeCopy, /Les universités et les autorités prennent les décisions officielles/);
});

test("signup form keeps Supabase auth behavior unchanged", () => {
  assert.match(form, /supabase.auth.signUp/);
  assert.match(form, /options: { data: { full_name:/);
  assert.match(form, /else if (data.session) router.push("/student")/);
  assert.match(nativeCopy, /checkEmail: "Vérifiez votre adresse email pour continuer."/);
  assert.doesNotMatch(form, /setError(signUpError.message)/);
});

test("signup form improves password and account navigation UX", () => {
  assert.match(progress, /{copy.step} {current} {copy.of} 3/);
  assert.match(form, /showPassword/);
  assert.match(nativeCopy, /minPassword: "8 caractères minimum"/);
  assert.match(nativeCopy, /emailConfirmation: "Confirmation par email"/);
  assert.match(form, /href="/login"/);
  assert.doesNotMatch(form, /setMode(mode === "login" ? "signup" : "login")/);
});

test("signup controls retain mobile-friendly minimum heights", () => {
  assert.match(form, /min-h-12/);
  assert.match(mobileHeader, /min-h-11/);
});
