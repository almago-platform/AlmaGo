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
