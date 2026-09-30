import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-authenticated-e2e.yml",
  "utf8",
);
const playwright = readFileSync("playwright.config.mjs", "utf8");
const helper = readFileSync("tests/e2e/auth-test-helpers.mjs", "utf8");

test("A43 marks authenticated runs for secret redaction", () => {
  assert.match(workflow, /ALMAGO_E2E_REDACT_SECRETS: "true"/);
});

test("A43 never uploads Playwright trace artifacts from authenticated runs", () => {
  assert.match(workflow, /path: artifacts\/auth-e2e\//);
  assert.doesNotMatch(workflow, /path: artifacts\/\s*$/m);
});

test("Playwright traces are disabled when A43 secret redaction is enabled", () => {
  assert.match(
    playwright,
    /process\.env\.ALMAGO_E2E_REDACT_SECRETS === "true" \? "off" : "retain-on-failure"/,
  );
});

test("A43 clears password fields before surfacing authentication failures", () => {
  assert.match(helper, /pathname === "\/login"/);
  assert.match(helper, /passwordInput\.fill\("", \{ timeout: 500 \}\)\.catch/);
  assert.match(helper, /Dedicated E2E credentials were rejected/);
});
