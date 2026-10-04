import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/0035_phase2_atomic_prospect_claim.sql");
const activation = read("src/lib/orientation/account-activation.ts");
const route = read("src/app/api/orientation/claim/route.ts");
const claimPage = read("src/app/orientation/claim/[token]/page.tsx");
const claimCard = read("src/components/orientation/OrientationClaimCard.tsx");
const signup = read("src/app/signup/page.tsx");
const login = read("src/app/login/page.tsx");
const authForm = read("src/components/auth/AuthForm.tsx");
const resetPage = read("src/app/reset-password/page.tsx");
const resetForm = read("src/components/auth/ResetPasswordForm.tsx");
const config = read("src/lib/phase2/config.ts");
const env = read(".env.example");
const report = read("src/app/orientation/report/[token]/page.tsx");

test("P2.4 stays independently disabled by default and email delivery depends on it", () => {
  assert.match(config, /isPhase2AccountLinkingEnabled/);
  assert.match(config, /ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED/);
  assert.match(config, /isPhase2ProspectCaptureEnabled\(env\) \|\| !isPhase2AccountLinkingEnabled\(env\)/);
  assert.match(env, /ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED=false/);
  assert.match(report, /accountLinkingEnabled \? \(/);
});

test("atomic claim validates auth identity, email, expiry and locks the prospect", () => {
  assert.match(migration, /security definer/i);
  assert.match(migration, /from auth\.users u/i);
  assert.match(migration, /u\.id = p_user_id/i);
  assert.match(migration, /lower\(u\.email\) = lower\(trim\(p_user_email\)\)/i);
  assert.match(migration, /o\.resume_token_hash = p_token_hash/i);
  assert.match(migration, /o\.resume_token_expires_at > now\(\)/i);
  assert.match(migration, /lower\(p\.email\) = lower\(trim\(p_user_email\)\)/i);
  assert.match(migration, /for update of p/i);
  assert.match(migration, /v_linked_user_id <> p_user_id/i);
  assert.match(migration, /other\.user_id = p_user_id/i);
  assert.match(migration, /set user_id = p_user_id/i);
  assert.match(migration, /on conflict \(user_id\) do nothing/i);
});

test("claim RPC is backend-only and browser cannot choose user identity", () => {
  assert.match(migration, /revoke execute[\s\S]+from public, anon, authenticated/i);
  assert.match(migration, /grant execute[\s\S]+to service_role/i);
  assert.match(route, /getAuthenticatedUser\(\)/);
  assert.match(route, /user\.id/);
  assert.match(route, /user\.email/);
  assert.match(route, /hashOrientationResumeToken\(token\)/);
  assert.match(route, /rpc\("claim_phase2_orientation"/);
  assert.doesNotMatch(route, /record\.user_id|record\.email|body.*user_id/i);
  assert.doesNotMatch(claimCard, /SUPABASE_SECRET|service_role|p_user_id|p_user_email/i);
});

test("activation resolver is server-only and never looks up by public database IDs", () => {
  assert.match(activation, /import "server-only"/);
  assert.match(activation, /hashOrientationResumeToken/);
  assert.match(activation, /resume_token_hash/);
  assert.match(activation, /resume_token_expires_at/);
  assert.match(activation, /createPrivilegedSupabaseClient/);
  assert.doesNotMatch(activation, /searchParams.*prospect|searchParams.*orientation/i);
});

test("signup and login prefill the known prospect identity only for a valid gated activation", () => {
  for (const source of [signup, login]) {
    assert.match(source, /isPhase2AccountLinkingEnabled\(\)/);
    assert.match(source, /resolveOrientationActivation/);
    assert.match(source, /orientationActivation=\{orientationActivation \?\? undefined\}/);
  }
  assert.match(authForm, /useState\(orientationActivation\?\.email \?\? ""\)/);
  assert.match(authForm, /useState\(orientationActivation\?\.firstName \?\? ""\)/);
  assert.match(authForm, /useState\(orientationActivation\?\.lastName \?\? ""\)/);
  assert.match(activation, /\.select\("prospect_id,input"\)/);
  assert.match(activation, /restorePublicOrientationIdentity/);
  assert.match(authForm, /readOnly=\{Boolean\(orientationActivation\)\}/);
  assert.match(authForm, /orientation_token=/);
});

test("signup confirmation, login and password recovery all preserve the secure claim destination", () => {
  assert.match(authForm, /\/orientation\/claim\//);
  assert.match(authForm, /emailRedirectTo/);
  assert.match(authForm, /auth\/callback\?next=/);
  assert.match(authForm, /reset-password\?orientation_token=/);
  assert.match(authForm, /router\.push\(activationClaimPath \?\? "\/student"\)/);
  assert.match(resetPage, /resolveOrientationActivation/);
  assert.match(resetPage, /orientationToken=\{orientationActivation\?\.token\}/);
  assert.match(resetForm, /\/orientation\/claim\//);
  assert.match(resetForm, /: "\/student"/);
});

test("claim happens through authenticated POST and returns the user to the saved orientation", () => {
  assert.match(claimPage, /getAuthenticatedUser\(\)/);
  assert.match(claimPage, /redirect\([\s\S]*\/signup\?orientation_token=/);
  assert.match(claimCard, /fetch\("\/api\/orientation\/claim"/);
  assert.match(claimCard, /method: "POST"/);
  assert.match(claimCard, /started\.current/);
  assert.match(claimCard, /\/orientation\/report\//);
  assert.match(claimCard, /freeAccountNote/);
  assert.doesNotMatch(claimCard, /\/student/);
});
