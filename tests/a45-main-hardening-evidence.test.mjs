import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-final-release-gate.yml",
  "utf8",
);

test("A45 requires completed repository hardening before exporting main SHA", () => {
  assert.match(workflow, /issue_number: 336/);
  assert.match(workflow, /hardeningIssue\.state === "closed"/);
  assert.match(workflow, /hardeningIssue\.state_reason !== "not_planned"/);
  assert.match(
    workflow,
    /A45 requires completed repository-hardening issue #336 before RELEASE GATE: READY/,
  );

  const hardeningIndex = workflow.indexOf(
    'const { data: hardeningIssue } = await github.rest.issues.get',
  );
  const outputIndex = workflow.indexOf('core.setOutput("main_sha", mainSha)');
  assert.notEqual(hardeningIndex, -1);
  assert.notEqual(outputIndex, -1);
  assert.ok(hardeningIndex < outputIndex);
});

test("A45 rechecks branch protection immediately before readiness publication", () => {
  assert.match(workflow, /if \(currentMain\.protected !== true\)/);
  assert.match(
    workflow,
    /main protection was removed during the release gate/,
  );
});

test("A45 rechecks #336 completion immediately before readiness publication", () => {
  assert.match(workflow, /const \{ data: finalHardeningIssue \}/);
  assert.match(workflow, /finalHardeningIssue\.state === "closed"/);
  assert.match(
    workflow,
    /repository-hardening issue #336 is no longer completed/,
  );
});
