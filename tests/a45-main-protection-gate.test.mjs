import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-final-release-gate.yml",
  "utf8",
);

test("A45 refuses release readiness when the default branch is unprotected", () => {
  assert.match(workflow, /if \(mainRef\.protected !== true\)/);
  assert.match(workflow, /Resolve repository-hardening issue #336/);
  assert.match(
    workflow,
    /A45 requires protected main before RELEASE GATE: READY can be published/,
  );
});

test("A45 still captures exact main only after the protection check", () => {
  const protectionIndex = workflow.indexOf("mainRef.protected !== true");
  const outputIndex = workflow.indexOf('core.setOutput("main_sha", mainSha)');
  assert.notEqual(protectionIndex, -1);
  assert.notEqual(outputIndex, -1);
  assert.ok(protectionIndex < outputIndex);
});
