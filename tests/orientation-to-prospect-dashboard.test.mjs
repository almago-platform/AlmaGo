import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const claimCard = read("src/components/orientation/OrientationClaimCard.tsx");
const signupPage = read("src/app/signup/page.tsx");
const claimApi = read("src/app/api/orientation/claim/route.ts");
const authForm = read("src/components/auth/AuthForm.tsx");

test("successful verified orientation claim opens the actual Prospect dashboard automatically", () => {
  assert.match(claimCard, /fetch\("\/api\/orientation\/claim"/);
  assert.match(claimCard, /method: "POST"/);
  assert.match(claimCard, /if \(response\.ok && payload\?\.linked\) \{[\s\S]*?router\.replace\("\/prospect"\)/);
  assert.match(claimCard, /else \{\s*setStatus\("error"\)/);
  assert.match(claimCard, /\[token, router\]/);
  assert.match(claimCard, /href="\/prospect"/); // Manual fallback when navigation is delayed.
  assert.match(claimApi, /hasVerifiedEmail\(user\)/);
  assert.match(claimApi, /rpc\("claim_phase2_orientation"/);
});

test("an existing confirmed candidate with matching email reuses their account", () => {
  assert.match(signupPage, /if \(orientationActivation\) \{/);
  assert.match(signupPage, /hasVerifiedEmail\(user\)/);
  assert.match(signupPage, /user\?\.email\?\.trim\(\)\.toLowerCase\(\) === orientationActivation\.email/);
  assert.match(signupPage, /redirect\(`\/orientation\/claim\/\$\{encodeURIComponent\(orientationActivation\.token\)\}`\)/);
});

test("unconfirmed signups remain in read-only preview rather than bypassing verification", () => {
  assert.match(authForm, /else if \(data\.session\) router\.push\(activationClaimPath/);
  assert.match(authForm, /else if \(prospectSignup && activationToken\)/);
  assert.match(authForm, /router\.replace\(`\/prospect-preview\/start\?orientation_token=/);
  assert.doesNotMatch(authForm, /router\.replace\("\/prospect"\)/);
  assert.match(claimApi, /if \(!hasVerifiedEmail\(user\)\)/);
  assert.match(claimApi, /status: 403/);
});
