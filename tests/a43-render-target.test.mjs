import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
const playwright = readFileSync("playwright.config.mjs", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const studentQuality = readFileSync("tests/e2e/student-space-quality.spec.mjs", "utf8");
const adminQuality = readFileSync("tests/e2e/admin-space-quality.spec.mjs", "utf8");

test("A43 workflow exposes an explicit Render target for manual Partner-Ready rehearsals", () => {
  assert.match(workflow, /target:\s*\n\s*description: "Authenticated E2E target"/);
  assert.match(workflow, /default: render/);
  assert.match(workflow, /- render\s*\n\s*- local/);
  assert.match(workflow, /ALMAGO_E2E_TARGET: \$\{\{ github\.event_name == 'issue_comment' && 'render' \|\| inputs\.target \|\| 'render' \}\}/);
  assert.doesNotMatch(workflow, /\n  push:/);
});

test("Render mode uses the canonical almago-dev URL and waits for health", () => {
  assert.match(workflow, /ALMAGO_BASE_URL=https:\/\/almago-dev\.onrender\.com/);
  assert.match(workflow, /\$ALMAGO_BASE_URL\/api\/health/);
  assert.match(workflow, /curl --fail --silent --show-error --max-time 10/);
  assert.match(workflow, /Render did not serve exact workflow revision/);
});

test("explicit local manual mode still builds the application locally", () => {
  assert.match(workflow, /Build and start AlmaGo locally/);
  assert.match(workflow, /if: env\.ALMAGO_E2E_TARGET != 'render'/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /http:\/\/127\.0\.0\.1:3000\/login/);
});

test("Playwright consumes ALMAGO_BASE_URL without embedding credentials", () => {
  assert.match(playwright, /process\.env\.ALMAGO_BASE_URL \|\| "http:\/\/127\.0\.0\.1:3000"/);
  assert.doesNotMatch(workflow, /phase3\.student\.a@almago\.test:[^\s]+@/);
  assert.doesNotMatch(workflow, /phase3\.admin@almago\.test:[^\s]+@/);
});


test("A43 quality matrices cover every canonical authenticated shell destination", () => {
  const studentRoutes = [
    "/student",
    "/student/project",
    "/student/profile",
    "/student/pathway",
    "/student/orientation",
    "/student/documents",
    "/student/applications",
    "/student/calendar",
    "/student/procedure",
    "/student/language-courses",
    "/student/finance-insurance",
  ];
  const adminRoutes = [
    "/admin",
    "/admin/documents",
    "/admin/applications",
    "/admin/orientation",
    "/admin/prospects",
    "/admin/offers",
    "/admin/payments",
    "/admin/universities",
    "/admin/programs",
    "/admin/language-courses",
    "/admin/finance-insurance",
  ];

  for (const route of studentRoutes) {
    assert.ok(shell.includes(`href: "${route}"`), "missing canonical Student shell route: " + route);
    assert.ok(studentQuality.includes(`path: "${route}"`), "A43 Student quality matrix misses: " + route);
  }

  for (const route of adminRoutes) {
    assert.ok(shell.includes(`href: "${route}"`), "missing canonical Admin shell route: " + route);
    assert.ok(adminQuality.includes(`path: "${route}"`), "A43 Admin quality matrix misses: " + route);
  }

  assert.ok(
    studentQuality.includes('path: "/student/checklist"'),
    "A43 should keep the legacy checklist route covered while procedure is primary",
  );
});
