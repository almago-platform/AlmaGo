import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { hasAdminAuthenticatorAssurance } from "../src/lib/auth/assurance.ts";

const read = (path) => readFileSync(path, "utf8");
const auth = read("src/lib/auth/access.ts");
const layout = read("src/app/admin/layout.tsx");
const challenge = read("src/components/auth/AdminMfaChallenge.tsx");
const migration = read("supabase/migrations/20261007130000_harden_candidate_student_boundary.sql");
const authenticatedE2e = read("tests/e2e/authenticated.spec.mjs");
const adminQualityE2e = read("tests/e2e/admin-space-quality.spec.mjs");
const authenticatedWorkflow = read(".github/workflows/almago-authenticated-e2e.yml");
const releaseWorkflow = read(".github/workflows/almago-release.yml");

test("admin server authorization fails closed unless the session is AAL2", () => {
  assert.equal(hasAdminAuthenticatorAssurance(null), false);
  assert.equal(hasAdminAuthenticatorAssurance("aal1"), false);
  assert.equal(hasAdminAuthenticatorAssurance("unexpected"), false);
  assert.equal(hasAdminAuthenticatorAssurance("aal2"), true);
  assert.match(auth, /getAuthenticatorAssuranceLevel/);
  assert.match(auth, /hasAdminRole/);
  assert.match(auth, /isAdmin:\s*hasAdminAuthenticatorAssurance\(aal\)/);
});

test("admin pages redirect an AAL1 admin to the dedicated MFA flow", () => {
  assert.match(layout, /getAdminUser/);
  assert.match(layout, /if \(!hasAdminRole\) redirect\("\/unauthorized"\)/);
  assert.match(layout, /if \(!isAdmin\) redirect\("\/mfa"\)/);
  assert.match(challenge, /mfa\.listFactors/);
  assert.match(challenge, /mfa\.enroll/);
  assert.match(challenge, /mfa\.challengeAndVerify/);
});

test("database admin policies inherit the AAL2 requirement", () => {
  const helper = migration.match(
    /create or replace function private\.is_admin\(\)[\s\S]*?\$\$;/i,
  )?.[0] ?? "";

  assert.match(helper, /security definer/i);
  assert.match(helper, /set search_path = ''/i);
  assert.match(helper, /auth\.jwt\(\) ->> 'aal'\) = 'aal2'/i);
  assert.match(helper, /public\.user_roles/i);
  assert.match(helper, /role\.role = 'admin'::public\.app_role/i);
  assert.doesNotMatch(helper, /user_metadata|raw_user_meta_data/i);
});

test("every sensitive custom admin route uses the canonical AAL2 guard", () => {
  for (const path of [
    "src/app/api/admin/offers/route.ts",
    "src/app/api/admin/payments/activate/route.ts",
    "src/app/api/admin/payments/manual-confirm/route.ts",
    "src/app/api/admin/prospects/qualification-review/route.ts",
  ]) {
    const source = read(path);
    assert.match(source, /getAdminUser\(\)/, path);
    assert.doesNotMatch(source, /from\(["']user_roles["']\)/, path);
  }
});

test("admin browser evidence never requires the sole real admin credentials in CI", () => {
  assert.match(authenticatedE2e, /optional disposable admin AAL1 fixture is challenged/);
  assert.match(authenticatedE2e, /optional disposable admin AAL2 fixture passes authorization/);
  assert.match(authenticatedE2e, /completeAdminMfaChallenge/);

  assert.match(adminQualityE2e, /admin-challenge/);
  assert.match(adminQualityE2e, /completeAdminMfaChallenge/);

  assert.doesNotMatch(authenticatedWorkflow, /ALMAGO_E2E_ADMIN_EMAIL/);
  assert.doesNotMatch(authenticatedWorkflow, /ALMAGO_E2E_ADMIN_PASSWORD/);
  assert.doesNotMatch(authenticatedWorkflow, /ALMAGO_E2E_ADMIN_TOTP_SECRET/);
  assert.match(authenticatedWorkflow, /Require exact-SHA human admin AAL2 evidence/);
  assert.match(
    authenticatedWorkflow,
    /almago-a43-admin-human-approved:sha=\$GITHUB_SHA/,
  );
  assert.match(authenticatedWorkflow, /author_association/);
  assert.match(authenticatedWorkflow, /issues\/84\/comments/);
  assert.match(authenticatedWorkflow, /workflow_call/);
  assert.match(releaseWorkflow, /almago-authenticated-e2e\.yml/);
});
