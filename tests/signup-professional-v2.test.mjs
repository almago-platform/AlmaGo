import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const signup = readFileSync("src/app/signup/page.tsx", "utf8");
const form = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const story = readFileSync("src/components/auth/AuthStoryPanel.tsx", "utf8");

test("signup page uses the new student registration composition", () => {
  assert.match(signup, /AuthStoryPanel mode="signup"/);
  assert.match(signup, /linear-gradient/);
  assert.match(signup, /Progression de création du dossier/);
  assert.match(signup, /max-w-\[36rem\]/);
});

test("signup story communicates the three-step account-to-dossier path", () => {
  assert.match(story, /Créer votre compte/);
  assert.match(story, /Définir votre projet/);
  assert.match(story, /Construire votre dossier/);
  assert.match(story, /7973208/);
  assert.match(story, /Les décisions d’admission, de visa/);
});

test("signup form keeps Supabase auth behavior unchanged", () => {
  assert.match(form, /supabase\.auth\.signUp/);
  assert.match(form, /options: \{ data: \{ full_name:/);
  assert.match(form, /else if \(data\.session\) router\.push\("\/student"\)/);
  assert.match(form, /Vérifiez votre adresse email pour continuer/);
});

test("signup form improves password and account navigation UX", () => {
  assert.match(form, /Étape 1 sur 3/);
  assert.match(form, /showPassword/);
  assert.match(form, /8 caractères minimum/);
  assert.match(form, /Confirmation par email/);
  assert.match(form, /href="\/login"/);
  assert.doesNotMatch(form, /setMode\(mode === "login" \? "signup" : "login"\)/);
});

test("signup controls retain mobile-friendly minimum heights", () => {
  assert.match(form, /min-h-12/);
  assert.match(signup, /min-h-11/);
});
