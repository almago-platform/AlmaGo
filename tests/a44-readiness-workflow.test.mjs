import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-a44-readiness.yml", "utf8");
const contract = JSON.parse(readFileSync("config/telemetry-events.json", "utf8"));

test("A44 readiness never activates telemetry or a provider", () => {
  assert.equal(contract.defaultMode, "disabled");
  assert.equal(contract.policy, "allowlist-only");
  assert.doesNotMatch(workflow, /POSTHOG|SENTRY|ANALYTICS_KEY|SENTRY_DSN/i);
  assert.doesNotMatch(workflow, /secrets\.(?!GITHUB_TOKEN\b)[A-Z0-9_]+/);
  assert.doesNotMatch(workflow, /emitTelemetry\(/);
});

test("A44 readiness requires both A38 and A43 to be closed", () => {
  assert.match(workflow, /findPlanTask\("A38"\)/);
  assert.match(workflow, /findPlanTask\("A43"\)/);
  assert.match(workflow, /a38\?\.state === "closed"/);
  assert.match(workflow, /a43\?\.state === "closed"/);
  assert.match(workflow, /Boolean\(a38Done && a43Done\)/);
});

test("A44 readiness validates the telemetry contract", () => {
  assert.match(workflow, /node --test tests\/telemetry-contract\.test\.mjs/);
});

test("A44 readiness publishes evidence but never closes A44", () => {
  assert.match(workflow, /almago-a44-provider-ready:sha=/);
  assert.match(workflow, /A44 is not closed by this workflow/);
  assert.doesNotMatch(workflow, /issues\.update\([^)]*state:\s*"closed"/s);
  assert.doesNotMatch(workflow, /state_reason:\s*"completed"/);
});
