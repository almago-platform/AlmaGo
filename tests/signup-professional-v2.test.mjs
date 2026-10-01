import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const signup = readFileSync("src/app/signup/page.tsx", "utf8");
const form = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const story = readFileSync("src/components/auth/AuthStoryPanel.tsx", "utf8");
const mobileHeader = readFileSync("src/components/auth/AuthMobileHeader.tsx", "utf8");
const progress = readFileSync("src/components/student/StudentEntryProgress.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const globals = readFileSync("src/app/globals.css", "utf8");
const login = readFileSync("src/app/login/page.tsx", "utf8");

test("signup page uses the new student registration composition", () => {
  assert.ok(signup.includes('AuthStoryPanel mode="signup"'));
  assert.ok(signup.includes("linear-gradient"));
  assert.ok(form.includes("<StudentEntryProgress current={1} compact />"));
  assert.ok(progress.includes("Progression de création du dossier"));
  assert.ok(signup.includes("max-w-[36rem]"));
});

test("signup story communicates the three-step account-to-dossier path", () => {
  assert.ok(nativeCopy.includes('"Créer votre compte"'));
  assert.ok(nativeCopy.includes('"Définir votre projet"'));
  assert.ok(nativeCopy.includes('"Préparer votre dossier"'));
  assert.ok(story.includes("7973208"));
  assert.ok(nativeCopy.includes("Les universités et les autorités prennent les décisions officielles"));
});

test("signup keeps the default Supabase auth behavior while supporting optional orientation activation", () => {
  assert.ok(form.includes("supabase.auth.signUp"));
  assert.ok(form.includes("data: { full_name:"));
  assert.ok(form.includes('router.push(activationClaimPath ?? "/student")'));
  assert.ok(form.includes("emailRedirectTo"));
  assert.ok(nativeCopy.includes('checkEmail: "Vérifiez votre adresse email pour continuer."'));
  assert.ok(!form.includes("setError(signUpError.message)"));
});

test("signup form improves password and account navigation UX", () => {
  assert.ok(progress.includes("completed ? copy.completedLabel"));
  assert.ok(form.includes("showPassword"));
  assert.ok(nativeCopy.includes('minPassword: "8 caractères minimum"'));
  assert.ok(nativeCopy.includes('emailConfirmation: "Confirmation par email"'));
  assert.ok(form.includes("href={loginHref}"));
  assert.ok(!form.includes('setMode(mode === "login" ? "signup" : "login")'));
});

test("signup controls retain mobile-friendly minimum heights", () => {
  assert.ok(form.includes("min-h-12"));
  assert.ok(mobileHeader.includes("min-h-11"));
});


test("Arabic auth layout keeps the form primary on desktop RTL", () => {
  assert.ok(login.includes("auth-page-grid"));
  assert.ok(signup.includes("auth-page-grid"));
  assert.ok(login.includes("auth-form-shell"));
  assert.ok(story.includes("auth-story-panel"));
  assert.match(globals, /Arabic Auth RTL Polish/);
  assert.match(globals, /auth-page-grid/);
  assert.match(globals, /direction: ltr/);
  assert.match(globals, /auth-story-panel/);
  assert.match(globals, /min-height: 640px/);
  assert.ok(form.includes('const passwordButtonSide = "right-2"'));
  assert.ok(form.includes('const passwordPadding = "pr-24 text-left"'));
});

test("auth story stock photos are decorative for screen readers", () => {
  assert.match(story, /alt=""/);
  assert.doesNotMatch(story, /Students working together in a university library/);
  assert.doesNotMatch(story, /Students reviewing documents outside a university building/);
});
