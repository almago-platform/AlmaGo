import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const browserWorkflow = read(".github/workflows/almago-browser-quality.yml");
const authWorkflow = read(".github/workflows/almago-authenticated-e2e.yml");
const gate = read("tests/e2e/visual-v3-2-gate.spec.mjs");
const studentQuality = read("tests/e2e/student-space-quality.spec.mjs");
const adminQuality = read("tests/e2e/admin-space-quality.spec.mjs");
const playwright = read("playwright.config.mjs");

test("V3.2 browser quality automatically gates UI pull requests", () => {
  assert.match(browserWorkflow, /pull_request:/);
  assert.match(browserWorkflow, /branches: \[main\]/);
  for (const path of [
    '"src\/app\/\*\*"',
    '"src\/components\/\*\*"',
    '"src\/content\/\*\*"',
    '"public\/\*\*"',
    '"tests\/e2e\/\*\*"',
    '"playwright\.config\.mjs"',
  ]) {
    assert.match(browserWorkflow, new RegExp(path));
  }
  assert.match(browserWorkflow, /V3\.2 bounded PR visual regression gate/);
  assert.match(browserWorkflow, /tests\/e2e\/visual-v3-2-gate\.spec\.mjs/);
});

test("automated visual PR gate remains bounded to representative release widths", () => {
  for (const project of [
    "mobile-compact-chromium",
    "mobile-chromium",
    "desktop-1280-chromium",
    "desktop-chromium",
  ]) {
    assert.match(browserWorkflow, new RegExp(`--project=${project}`));
  }
  assert.match(playwright, /mobile-compact-chromium[\s\S]*width: 320/);
  assert.match(playwright, /mobile-chromium[\s\S]*width: 390/);
  assert.match(playwright, /desktop-1280-chromium[\s\S]*width: 1280/);
  assert.match(playwright, /desktop-chromium[\s\S]*width: 1440/);
});

test("manual browser QA keeps the exhaustive suite while paid AI and Lighthouse stay manual", () => {
  assert.match(browserWorkflow, /Full manual responsive and accessibility suite/);
  assert.match(browserWorkflow, /if: github\.event_name == 'workflow_dispatch'[\s\S]*npx playwright test --config=playwright\.config\.mjs/);
  assert.match(browserWorkflow, /Gemini visual review of screenshots[\s\S]*github\.event_name == 'workflow_dispatch'/);
  assert.match(browserWorkflow, /Lighthouse advisory budgets[\s\S]*if: github\.event_name == 'workflow_dispatch'/);
});

test("V3.2 public browser gate covers candidate surfaces, RTL and reduced motion", () => {
  for (const route of ["/", "/login", "/signup", "/orientation", "/contact"]) {
    assert.ok(gate.includes(`path: "${route}"`) || gate.includes(`page.goto("${route}"`), route);
  }
  assert.match(gate, /document\.documentElement\.scrollWidth - document\.documentElement\.clientWidth/);
  assert.match(gate, /selectOption\("ar"\)/);
  assert.match(gate, /toHaveAttribute\("dir", "rtl"\)/);
  assert.match(gate, /emulateMedia\(\{ reducedMotion: "reduce" \}\)/);
  assert.match(gate, /prefers-reduced-motion: reduce/);
  assert.match(gate, /transitionDuration/);
  assert.match(gate, /artifacts\/visual-v3-2/);
});

test("authenticated Student and Admin visual quality remains delegated to A43", () => {
  assert.match(authWorkflow, /A43 AUTHENTICATED E2E PROBE/);
  assert.match(authWorkflow, /tests\/e2e\/student-space-quality\.spec\.mjs/);
  assert.match(authWorkflow, /tests\/e2e\/admin-space-quality\.spec\.mjs/);
  assert.match(authWorkflow, /ALMAGO_E2E_STUDENT_PASSWORD/);
  assert.match(authWorkflow, /ALMAGO_E2E_ADMIN_PASSWORD/);
  assert.match(studentQuality, /must not overflow horizontally/);
  assert.match(studentQuality, /toHaveAttribute\("dir", "rtl"\)/);
  assert.match(studentQuality, /new AxeBuilder/);
  assert.match(adminQuality, /must not overflow horizontally/);
  assert.match(adminQuality, /new AxeBuilder/);
});

test("browser artifacts retain visual evidence and failure output", () => {
  assert.match(browserWorkflow, /actions\/upload-artifact@v7/);
  assert.match(browserWorkflow, /artifacts\//);
  assert.match(browserWorkflow, /test-results\//);
  assert.match(browserWorkflow, /retention-days: 7/);
});
