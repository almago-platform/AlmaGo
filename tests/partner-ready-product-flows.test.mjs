import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const workflow = read(".github/workflows/almago-partner-ready-rehearsal.yml");
const publicQuality = read("tests/e2e/public-quality.spec.mjs");
const auth = read("tests/e2e/authenticated.spec.mjs");
const student = read("tests/e2e/student-space-quality.spec.mjs");
const admin = read("tests/e2e/admin-space-quality.spec.mjs");

test("Partner-Ready rehearsal is explicit, owner-triggered and exact-main Render only", () => {
  assert.match(workflow, /issue\.number == 686/);
  assert.match(workflow, /comment\.user\.login == 'tayariAyoub'/);
  assert.match(workflow, /comment\.body == 'PARTNER READY REHEARSAL'/);
  assert.match(workflow, /ref: main/);
  assert.match(workflow, /ALMAGO_BASE_URL: https:\/\/almago-dev\.onrender\.com/);
  assert.match(workflow, /exposureMode/);
  assert.match(workflow, /partner_prelaunch/);
  assert.match(workflow, /current_main/);
  assert.match(workflow, /Render drifted during Partner-Ready rehearsal/);
  assert.doesNotMatch(workflow, /deploy|trigger_deploy|render\.com\/deploy/i);
});

test("Partner-Ready public rehearsal covers Phase 2, FR/AR RTL and representative viewports", () => {
  assert.match(workflow, /ALMAGO_PHASE2_ENABLED: "true"/);
  assert.match(
    workflow,
    /public-quality\.spec\.mjs --project=desktop-chromium --project=tablet-chromium --project=mobile-360-chromium/,
  );
  assert.match(publicQuality, /\/orientation/);
  assert.match(publicQuality, /selectOption\("ar"\)/);
  assert.match(publicQuality, /toHaveAttribute\("dir", "rtl"\)/);
  assert.match(publicQuality, /serious/);
  assert.match(publicQuality, /critical/);
});

test("Partner-Ready rehearsal proves role isolation and broad student/admin surfaces", () => {
  assert.match(workflow, /authenticated\.spec\.mjs/);
  assert.match(workflow, /student-space-quality\.spec\.mjs/);
  assert.match(workflow, /admin-space-quality\.spec\.mjs/);

  assert.match(auth, /student account reaches only the student area/);
  assert.match(auth, /admin AAL1 is challenged before page and API authorization/);
  assert.match(auth, /admin AAL2 passes page and API authorization/);
  assert.match(auth, /completeAdminMfaChallenge/);

  for (const route of [
    "/student",
    "/student/profile",
    "/student/documents",
    "/student/orientation",
    "/student/checklist",
    "/student/applications",
    "/student/project",
    "/student/pathway",
    "/student/language-courses",
    "/student/finance-insurance",
  ]) {
    assert.match(student, new RegExp(route.replaceAll("/", "\\/")));
  }

  for (const route of [
    "/admin",
    "/admin/documents",
    "/admin/applications",
    "/admin/orientation",
    "/admin/universities",
    "/admin/programs",
    "/admin/language-courses",
    "/admin/finance-insurance",
    "/admin/offers",
    "/admin/payments",
  ]) {
    assert.match(admin, new RegExp(route.replaceAll("/", "\\/")));
  }
});

test("Partner-Ready rehearsal accepts dedicated synthetic identities only and redacts traces", () => {
  assert.match(workflow, /\*e2e\*\|\*test\*/);
  assert.match(workflow, /ALMAGO_E2E_REDACT_SECRETS: "true"/);
  assert.match(workflow, /Missing Partner-Ready rehearsal configuration/);
});
