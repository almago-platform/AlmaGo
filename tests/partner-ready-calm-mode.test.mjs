import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manualOnly = [
  ".github/workflows/almago-master-orchestrator.yml",
  ".github/workflows/almago-ai-backlog-dispatch.yml",
  ".github/workflows/almago-prelaunch-self-heal.yml",
  ".github/workflows/almago-prelaunch-visual-quality.yml",
  ".github/workflows/almago-prelaunch-performance.yml",
  ".github/workflows/almago-postmerge-sentinel.yml",
  ".github/workflows/almago-merged-branch-cleanup.yml",
  ".github/workflows/almago-a38-readiness.yml",
  ".github/workflows/almago-autopilot-safe-merge.yml",
  ".github/workflows/almago-autopilot-safe-merge-observer.yml",
];

test("Partner-Ready Calm Mode keeps heavy/autonomous workflows manual", () => {
  for (const path of manualOnly) {
    const workflow = readFileSync(path, "utf8");
    assert.match(workflow, /workflow_dispatch:/, path);
    assert.doesNotMatch(workflow, /\n  schedule:/, path);
    assert.doesNotMatch(workflow, /\n  push:/, path);
  }
});

test("Browser Quality allows only the bounded V3.2 UI PR gate during Calm Mode", () => {
  const workflow = readFileSync(".github/workflows/almago-browser-quality.yml", "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /\n  pull_request:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /V3\.2 bounded PR visual regression gate/);
  assert.match(workflow, /tests\/e2e\/visual-v3-2-gate\.spec\.mjs/);
  assert.doesNotMatch(workflow, /\n  push:/);
  assert.doesNotMatch(workflow, /\n  schedule:/);
});

test("Authenticated E2E stays owner/manual driven", () => {
  const workflow = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");
  assert.match(workflow, /issue_comment:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\n  push:/);
});

test("Vercel automatic Git deployments are disabled during Calm Mode", () => {
  const config = JSON.parse(readFileSync("vercel.json", "utf8"));
  assert.equal(config.git?.deploymentEnabled, false);
});

test("Canonical PR CI remains the authoritative build gate beside bounded Browser Quality", () => {
  const workflow = readFileSync(".github/workflows/almago-pr-ci.yml", "utf8");
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /Tests/);
  assert.match(workflow, /Typecheck/);
  assert.match(workflow, /Lint/);
  assert.match(workflow, /Build/);
  assert.match(workflow, /Diff check/);
});
