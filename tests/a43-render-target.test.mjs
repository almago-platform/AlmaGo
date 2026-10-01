import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
const playwright = readFileSync("playwright.config.mjs", "utf8");

test("A43 workflow exposes an explicit Render target and uses it for main-push rehearsals", () => {
  assert.match(workflow, /target:\s*\n\s*description: "Authenticated E2E target"/);
  assert.match(workflow, /default: render/);
  assert.match(workflow, /- render\s*\n\s*- local/);
  assert.match(
    workflow,
    /ALMAGO_E2E_TARGET: \$\{\{ inputs\.target \|\| \(github\.event_name == 'push' && 'render'\) \|\| 'local' \}\}/,
  );
});

test("Render mode uses the canonical almago-dev URL and waits for health", () => {
  assert.match(workflow, /ALMAGO_BASE_URL=https:\/\/almago-dev\.onrender\.com/);
  assert.match(workflow, /\$ALMAGO_BASE_URL\/api\/health/);
  assert.match(workflow, /curl --fail --silent --show-error --max-time 10/);
  assert.match(workflow, /Render did not serve exact workflow revision/);
});

test("local manual/probe mode still builds the application locally", () => {
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
