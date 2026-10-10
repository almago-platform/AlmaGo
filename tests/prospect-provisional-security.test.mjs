import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const start = read("src/app/prospect-preview/start/route.ts");
const leave = read("src/app/prospect-preview/leave/route.ts");
const preview = read("src/app/prospect-preview/page.tsx");
const provisional = read("src/lib/prospect/provisional.ts");
const cookie = read("src/lib/prospect/provisional-cookie.ts");
const auth = read("src/lib/auth/access.ts");
const verified = read("src/lib/auth/verified.ts");
const form = read("src/components/auth/AuthForm.tsx");
const resend = read("src/components/prospect/ProvisionalEmailVerification.tsx");
const catalogue = read("src/components/prospect/ProvisionalProgrammeSearch.tsx");
const copy = read("src/content/prospect-provisional-copy.ts");

test("public Prospect preview has no authenticated role, user impersonation, or write capability", () => {
  assert.match(preview, /loadProvisionalOrientation/);
  assert.match(preview, /loadVerifiedProgrammeCatalogue/);
  assert.match(preview, /isPhase2AccountLinkingEnabled/);
  assert.match(preview, /robots: \{ index: false, follow: false \}/);
  assert.doesNotMatch(preview, /\.insert\(|\.update\(|\.delete\(|\.rpc\("service_/);
  assert.doesNotMatch(provisional, /\.insert\(|\.update\(|\.delete\(|\.rpc\(/);
  assert.doesNotMatch(start, /\.insert\(|\.update\(|\.delete\(|claim_phase2_orientation/);
  assert.doesNotMatch(preview, /customer_access|student_intake_cases|payments|\.from\("prospects"\)/);
});

test("preview bearer token is validated and scoped to existing orientation only", () => {
  assert.match(start, /hashOrientationResumeToken\(raw\)/);
  assert.match(start, /\.eq\("resume_token_hash", hash\)/);
  assert.match(start, /\.gt\("resume_token_expires_at", new Date\(\)\.toISOString\(\)\)/);
  assert.match(start, /\.eq\("engine_version", "public-orientation-v1"\)/);
  assert.match(start, /sameSite: "lax"/);
  assert.match(start, /httpOnly: true/);
  assert.match(start, /secure: process\.env\.NODE_ENV === "production"/);
  assert.match(start, /Referrer-Policy"(?::|,) "no-referrer"/);
  assert.match(start, /"private, no-store"/);
  assert.match(cookie, /PROVISIONAL_COOKIE_TTL_SECONDS = 60 \* 60 \* 4/);
  assert.match(cookie, /PROVISIONAL_COOKIE_PATH = "\/prospect-preview"/);
  assert.match(leave, /maxAge: 0/);
  assert.match(provisional, /hashOrientationResumeToken\(token\)/);
  assert.match(provisional, /select\("input"\)/);
  assert.doesNotMatch(provisional, /select\(".*identity|select\(".*email/);
  assert.doesNotMatch(provisional, /\.ilike\("email"/);
});

test("unverified or anonymous sessions cannot acquire a Student role or mutate sensitive state", () => {
  assert.match(verified, /user\.email_confirmed_at/);
  assert.match(verified, /user\.is_anonymous !== true/);
  assert.match(auth, /if \(!hasVerifiedEmail\(user\)\) return \{ supabase, user, isStudent: false \}/);
  for (const path of [
    "src/app/api/orientation/claim/route.ts",
    "src/app/api/orientation/recover/route.ts",
    "src/app/api/intake/orientation/confirm/route.ts",
    "src/app/api/intake/route/confirm/route.ts",
    "src/app/api/intake/route/discuss/route.ts",
    "src/app/api/dossier-messages/[messageId]/attachment/route.ts",
  ]) {
    const route = read(path);
    assert.match(route, /hasVerifiedEmail\(user\)/, path);
    assert.match(route, /status: (403|409)/, path);
  }
});

test("signup with no session redirects only to read-only provisional preview", () => {
  assert.match(form, /else if \(data\.session\) router\.push/);
  assert.match(form, /else if \(prospectSignup && activationToken\)/);
  assert.match(form, /\/prospect-preview\/start\?orientation_token=/);
  assert.match(form, /setPassword\(" "\)|setPassword\(" "\)|setPassword\(" "\)|setPassword\(""\)/);
  assert.doesNotMatch(start, /auth\.signInAnonymously|auth\.admin/);
});

test("resend never reveals email registration status; catalogue comes from public programme RPC", () => {
  assert.match(resend, /auth\.resend\(\{[\s\S]*type: "signup"/);
  assert.match(resend, /emailRedirectTo/);
  assert.match(resend, /setState\("sent"\)/);
  assert.doesNotMatch(resend, /getUserByEmail|listUsers|isRegistered/);
  assert.match(catalogue, /useMemo/);
  assert.match(catalogue, /referrerPolicy="no-referrer"/);
  assert.match(preview, /safeSource\(item\.programmeSourceUrl\)/);
  assert.match(copy, /aucun compte n'est confirmé|Aucun compte n'est considéré comme vérifié/);
  for (const lang of ["fr:", "ar:", "en:", "de:"]) assert.ok(copy.includes(lang));
});
