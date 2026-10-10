import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const accountSchema = read("supabase/migrations/20261010200000_provisional_candidate_auth_foundation.sql");
const lockoutSchema = read("supabase/migrations/20261010200100_provisional_candidate_login_lockout.sql");
const auth = read("src/lib/prospect/provisional-auth.ts");
const signup = read("src/app/api/provisional-session/start/route.ts");
const login = read("src/app/api/provisional-session/login/route.ts");
const logout = read("src/app/api/provisional-session/logout/route.ts");
const env = read(".env.example");
const currentAuth = read("src/lib/auth/access.ts");
const currentClaim = read("src/app/api/orientation/claim/route.ts");

test("seven-day provisional credential storage is private, isolated and opt-in", () => {
  assert.match(accountSchema, /create table public\.provisional_candidate_credentials/i);
  assert.match(accountSchema, /orientation_id uuid not null unique references public\.orientations/i);
  assert.match(accountSchema, /expires_at timestamptz not null default \(now\(\) \+ interval '7 days'\)/i);
  assert.match(accountSchema, /create table public\.provisional_candidate_sessions/i);
  assert.match(accountSchema, /token_hash text not null unique/i);
  assert.match(accountSchema, /alter table public\.provisional_candidate_credentials enable row level security/i);
  assert.match(accountSchema, /alter table public\.provisional_candidate_sessions enable row level security/i);
  assert.match(accountSchema, /revoke all on public\.provisional_candidate_credentials from public, anon, authenticated/i);
  assert.match(accountSchema, /revoke all on public\.provisional_candidate_sessions from public, anon, authenticated/i);
  assert.doesNotMatch(accountSchema, /alter table (public\.)?(documents|user_roles|customer_access|prospects) disable row level security/i);
  assert.match(env, /ALMAGO_PROVISIONAL_AUTH_ENABLED=false/);
  assert.match(auth, /ALMAGO_PROVISIONAL_AUTH_ENABLED === "true"/);
  assert.match(auth, /isPhase2AccountLinkingEnabled\(\)/);
  assert.match(auth, /isPhase2ProspectCaptureEnabled\(\)/);
});

test("passwords and session tokens are cryptographically protected and never returned", () => {
  assert.match(auth, /scrypt\(password, salt, 64, \{ N: 16384/);
  assert.match(auth, /timingSafeEqual\(actual, expected\)/);
  assert.match(auth, /randomBytes\(32\)\.toString\("base64url"\)/);
  assert.match(auth, /hashProvisionalToken\(secret\)/);
  assert.match(auth, /httpOnly: true/);
  assert.match(auth, /secure: process\.env\.NODE_ENV === "production"/);
  assert.match(auth, /sameSite: "lax"/);
  assert.match(auth, /expires: new Date\(expiresAt\)/);
  assert.match(auth, /\.gt\("expires_at", now\)/);
  assert.match(auth, /\.is\("revoked_at", null\)/);
  assert.match(auth, /\.is\("verified_user_id", null\)/);
  assert.doesNotMatch(signup, /return NextResponse\.json\(\{[^}]*password_hash/s);
  assert.doesNotMatch(login, /console\.log\(.*password/);
});

test("new temporary credential needs a valid saved orientation and matching email", () => {
  assert.match(signup, /hashOrientationResumeToken\(body\.token\)/);
  assert.match(signup, /\.eq\("resume_token_hash", tokenHash\)/);
  assert.match(signup, /\.gt\("resume_token_expires_at", new Date\(\)\.toISOString\(\)\)/);
  assert.match(signup, /normalizeProvisionalEmail\(prospect\?\.email\) !== email \|\| prospect\?\.user_id/);
  assert.match(signup, /isTrustedProvisionalMutation\(request\)/);
  assert.match(signup, /enforceRequestRateLimit/);
  assert.doesNotMatch(signup, /claim_phase2_orientation|auth\.admin\.updateUserById/);
});

test("cross-device password login has durable lockout and anonymous-safe errors", () => {
  assert.match(login, /verifyProvisionalPassword\(password, credential\.password_hash\)/);
  assert.match(login, /record_provisional_login_failure/);
  assert.match(lockoutSchema, /least\(failed_attempts \+ 1, 10\)/);
  assert.match(lockoutSchema, /now\(\) \+ interval '15 minutes'/);
  assert.match(lockoutSchema, /revoke execute on function public\.record_provisional_login_failure\(uuid\) from public, anon, authenticated/);
  assert.match(login, /hashProvisionalPassword\("fixed-invalid-credential"\)/);
  assert.match(login, /isTrustedProvisionalMutation\(request\)/);
  assert.match(login, /\.gt\("expires_at", new Date\(\)\.toISOString\(\)\)/);
});

test("logout revokes server-side session without opening paid Prospect access", () => {
  assert.match(logout, /revokeCurrentProvisionalSession\(\)/);
  assert.match(auth, /\.update\(\{ revoked_at: new Date\(\)\.toISOString\(\) \}\)/);
  assert.match(currentAuth, /if \(!hasVerifiedEmail\(user\)\)/);
  assert.match(currentClaim, /if \(!hasVerifiedEmail\(user\)\)/);
  assert.doesNotMatch(signup + login + logout, /\/api\/prospect\/documents\/upload|\/api\/prospect\/payment/);
});

const dashboard = read("src/app/prospect/page.tsx");
const layout = read("src/app/prospect/layout.tsx");
const shell = read("src/components/layout/ProspectShell.tsx");
const documentPage = read("src/app/prospect/documents/page.tsx");
const documentUI = read("src/components/prospect/StarterDocumentsPanel.tsx");
const upload = read("src/app/api/provisional-documents/upload/route.ts");
const readDocument = read("src/app/api/provisional-documents/[id]/view/route.ts");
const deleteDocument = read("src/app/api/provisional-documents/[id]/route.ts");
const documentMigration = read("supabase/migrations/20261010200200_provisional_candidate_documents.sql");
const handoff = read("src/lib/prospect/provisional-handoff.ts");
const claim = read("src/app/api/orientation/claim/route.ts");
const payment = read("src/app/prospect/payment/page.tsx");

test("same ProspectShell and free dashboard are used without Supabase role elevation", () => {
  assert.match(layout, /getProvisionalIdentity\(\)/);
  assert.match(layout, /<ProspectShell displayName=\{candidate\.firstName\} provisional/);
  assert.match(dashboard, /<ProvisionalProspectDashboard identity=\{temporary\}/);
  assert.match(shell, /provisionalExpiresAt/);
  assert.match(shell, /\/api\/provisional-session\/logout/);
  assert.match(shell, /journeyLinks\.filter/);
  assert.doesNotMatch(payment, /getProvisionalIdentity/);
});

test("provisional documents are private and all file operations are credential-scoped", () => {
  assert.match(documentMigration, /create table public\.provisional_candidate_documents/i);
  assert.match(documentMigration, /enable row level security/i);
  assert.match(documentMigration, /revoke all on public\.provisional_candidate_documents from public, anon, authenticated/i);
  assert.match(documentMigration, /'provisional-starter-documents'/);
  assert.match(documentMigration, /false,/);
  assert.match(upload, /getProvisionalIdentity\(\)/);
  assert.match(upload, /isTrustedProvisionalMutation\(request\)/);
  assert.match(upload, /hasAllowedDocumentSignature\(file\)/);
  assert.match(upload, /isSafeDocumentFile\(file\)/);
  assert.match(upload, /credential_id: identity\.id/);
  assert.match(readDocument, /\.eq\("credential_id", identity\.id\)/);
  assert.match(deleteDocument, /\.eq\("credential_id", identity\.id\)/);
  assert.match(deleteDocument, /isTrustedProvisionalMutation\(request\)/);
  assert.match(documentPage, /\.eq\("credential_id", pending\.id\)/);
  assert.match(documentUI, /provisional \? "\/api\/provisional-documents/);
});

test("verified claim migrates documents idempotently and revokes temporary access", () => {
  assert.match(claim, /hasVerifiedEmail\(user\)/);
  assert.match(claim, /rpc\("claim_phase2_orientation"/);
  assert.match(claim, /isProvisionalCandidateEnabled\(\)/);
  assert.match(claim, /handoffProvisionalDocuments\(\{/);
  assert.match(handoff, /\.eq\("orientation_id", orientationId\)/);
  assert.match(handoff, /\.eq\("email", verifiedEmail\.trim\(\)\.toLowerCase\(\)\)/);
  assert.match(handoff, /\.eq\("credential_id", credential\.id\)/);
  assert.match(handoff, /already\.student_id !== userId/);
  assert.match(handoff, /\.from\("student-documents"\)/);
  assert.match(handoff, /\.from\("documents"\)\.insert\(\{/);
  assert.match(handoff, /verified_user_id: userId/);
  assert.match(handoff, /\.from\("provisional_candidate_sessions"\)/);
  assert.doesNotMatch(handoff, /select\("\*"\)/);
});

const verifiedReturn = read("src/app/orientation/verified-return/route.ts");
const emailVerificationUI = read("src/components/prospect/ProvisionalEmailVerification.tsx");

test("Supabase resend confirmation performs verified-only recovery and file handoff", () => {
  assert.match(emailVerificationUI, /initialEmail \? "\/orientation\/verified-return" : "\/prospect"/);
  assert.match(verifiedReturn, /getAuthenticatedUser\(\)/);
  assert.match(verifiedReturn, /hasVerifiedEmail\(user\)/);
  assert.match(verifiedReturn, /service_recover_and_confirm_latest_orientation/);
  assert.match(verifiedReturn, /p_user_id: user\.id, p_user_email: user\.email/);
  assert.match(verifiedReturn, /handoffProvisionalDocuments\(\{/);
  assert.match(verifiedReturn, /if \(!moved\) return responseTo\("\/prospect\/orientation"\)/);
  assert.match(verifiedReturn, /"Cache-Control": "private, no-store"/);
  assert.match(verifiedReturn, /Location: path/);
  assert.doesNotMatch(verifiedReturn, /request\.url|searchParams|admin\.updateUserById/);
});

const verifiedEmailCollision = read("supabase/migrations/20261010200300_block_provisional_verified_email_collisions.sql");

test("existing Supabase-verified email cannot gain a competing temporary credential", () => {
  assert.match(verifiedEmailCollision, /from auth\.users u/i);
  assert.match(verifiedEmailCollision, /u\.email_confirmed_at is not null/i);
  assert.match(verifiedEmailCollision, /before insert on public\.provisional_candidate_credentials/i);
  assert.match(verifiedEmailCollision, /revoke execute on function public\.reject_provisional_confirmed_email_collision\(\)/i);
});

const exactProvisionalRecovery = read("supabase/migrations/20261010200400_recover_exact_provisional_orientation.sql");

test("verified recovery preserves the specific pending orientation across re-orientations", () => {
  assert.match(verifiedReturn, /service_recover_and_confirm_provisional_orientation/);
  assert.match(verifiedReturn, /pending\?\.orientation_id/);
  assert.match(exactProvisionalRecovery, /service_claim_prospect_by_verified_email/);
  assert.match(exactProvisionalRecovery, /c\.email = lower\(btrim\(p_user_email\)\)/);
  assert.match(exactProvisionalRecovery, /o\.prospect_id = v_prospect_id/);
  assert.match(exactProvisionalRecovery, /c\.verified_user_id is null or c\.verified_user_id = p_user_id/);
  assert.match(exactProvisionalRecovery, /service_confirm_student_orientation\(p_user_id, v_orientation_id\)/);
  assert.match(exactProvisionalRecovery, /revoke execute on function public\.service_recover_and_confirm_provisional_orientation/);
});

test("rate limits are enforced both per network and account for expensive password routes", () => {
  assert.match(signup, /const ipLimited = enforceRequestRateLimit\(request, PUBLIC_ABUSE_POLICIES\.orientationAccountMutation\)/);
  assert.match(login, /const ipLimited = enforceRequestRateLimit\(request, PUBLIC_ABUSE_POLICIES\.orientationAccountMutation\)/);
  assert.match(signup, /accountId: email/);
  assert.match(login, /accountId: email/);
});

test("provisional sign-out refuses success when server-side revocation fails", () => {
  assert.match(auth, /if \(error\) return false;/);
  assert.match(logout, /if \(!revoked\) \{/);
  assert.match(logout, /status: 503/);
});

const authFormWithEmailThrottle = read("src/components/auth/AuthForm.tsx");

test("Supabase email-send throttling does not prevent an orientation-scoped temporary session", () => {
  assert.match(authFormWithEmailThrottle, /signUpError\.code === "over_email_send_rate_limit"/);
  assert.match(authFormWithEmailThrottle, /mailThrottled && prospectSignup && activationToken && provisionalAccessEnabled/);
  assert.match(authFormWithEmailThrottle, /await tryStartProvisionalAccess\(activationToken\)/);
  assert.match(authFormWithEmailThrottle, /router\.replace\("\/prospect"\)/);
  assert.match(authFormWithEmailThrottle, /if \(!response\?\.ok\) return false/);
  assert.match(authFormWithEmailThrottle, /setError\(auth\.messages\.signupError\)/);
  assert.doesNotMatch(authFormWithEmailThrottle, /if \(signUpError\)[\s\S]{0,500}auth\.admin|updateUserById/);
});

test("an expired orientation, confirmed identity or missing feature gate still fails closed", () => {
  assert.match(signup, /\.gt\("resume_token_expires_at", new Date\(\)\.toISOString\(\)\)/);
  assert.match(signup, /normalizeProvisionalEmail\(prospect\?\.email\) !== email \|\| prospect\?\.user_id/);
  assert.match(signup, /isProvisionalCandidateEnabled\(\)/);
  assert.match(authFormWithEmailThrottle, /const mailThrottled = signUpError\.code === "over_email_send_rate_limit"/);
  assert.match(authFormWithEmailThrottle, /if \(provisionalAccessEnabled && await tryStartProvisionalAccess\(activationToken\)\) return/);
});
