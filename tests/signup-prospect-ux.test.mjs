import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const form = read("src/components/auth/AuthForm.tsx");
const signup = read("src/app/signup/page.tsx");
const story = read("src/components/auth/AuthStoryPanel.tsx");
const copy = read("src/content/orientation-signup-copy.ts");

test("post-signup does not infer account creation or email delivery from Supabase's non-disclosing response", () => {
  assert.match(form, /else if \(data\.session\) router\.push/);
  assert.match(form, /setSignupSubmitted\(true\)/);
  assert.match(form, /mode === "signup" && signupSubmitted/);
  assert.match(form, /signupCopy\.existingHint/);
  assert.match(form, /signupCopy\.genericDescription/);
  assert.doesNotMatch(form, /setMessage\(auth\.messages\.checkEmail\)/);
  assert.doesNotMatch(form, /listUsers|getUserByEmail|email_exists|already_registered/i);
});

test("post-signup offers login, password recovery, confirmation resend and back navigation", () => {
  assert.match(form, /href=\{loginHref\}/);
  assert.match(form, /setMode\("forgot"\)/);
  assert.match(form, /supabase\.auth\.resetPasswordForEmail/);
  assert.match(form, /auth\.resend\(\{/);
  assert.match(form, /type: "signup"/);
  assert.match(form, /disabled=\{resendState !== "idle"\}/);
  assert.match(form, /signupCopy\.resendFailure/);
  assert.match(form, /signupCopy\.resendSuccess/);
  assert.match(form, /setSignupSubmitted\(false\)/);
});

test("orientation token survives sign-in, password recovery and confirmation resend", () => {
  assert.match(form, /loginHref = activationToken/);
  assert.match(form, /\/login\?orientation_token=/);
  assert.match(form, /\/reset-password\?orientation_token=/);
  assert.match(form, /\/orientation\/claim\//);
  assert.match(form, /emailRedirectTo/);
});

test("orientation-linked signup shows Prospect, never an automatically active Student account", () => {
  assert.match(signup, /prospectSignup=\{Boolean\(orientationActivation\)\}/);
  assert.match(story, /orientation\.badge/);
  assert.match(story, /orientation\.storyPoints/);
  assert.match(form, /prospectSignup \? signupCopy\.badge : auth\.labels\.studentAccount/);
  assert.match(form, /signupCopy\.boundary/);
  assert.match(copy, /L'espace étudiant et les documents ne sont pas activés automatiquement/);
  assert.match(copy, /No payment is requested|Aucun paiement n’est demandé|Aucun paiement n’est demandé/);
});

test("confirmation guidance is translated to French, Arabic, English and German", () => {
  for (const key of ["fr:", "ar:", "en:", "de:"]) {
    assert.ok(copy.includes(key));
  }
  for (const key of ["pendingTitle:", "existingHint:", "login:", "recover:", "resend:", "resendSuccess:", "boundary:"]) {
    assert.equal((copy.match(new RegExp(key, "g")) || []).length, 4, key);
  }
});
