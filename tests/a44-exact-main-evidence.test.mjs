import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-a44-observability-gate.yml",
  "utf8",
);

test("A44 requires dispatch from exact current main", () => {
  assert.match(workflow, /const expectedRef = `refs\/heads\/\$\{mainBranch\}`/);
  assert.match(workflow, /if \(context\.ref !== expectedRef\)/);
  assert.match(workflow, /if \(context\.sha !== mainSha\)/);
  assert.match(workflow, /core\.setOutput\("main_sha", mainSha\)/);
});

test("A44 checks out the exact captured main SHA", () => {
  assert.match(
    workflow,
    /ref: \$\{\{ steps\.preflight\.outputs\.main_sha \}\}/,
  );
});

test("A44 refuses to close if main moves during verification", () => {
  assert.match(workflow, /EXPECTED_MAIN_SHA/);
  assert.match(workflow, /currentMain\.commit\.sha !== expectedSha/);
  assert.match(workflow, /main changed during verification/);
});

test("A44 evidence marker is bound to the captured main SHA", () => {
  assert.match(
    workflow,
    /almago-a44-evidence:run=\$\{context\.runId\};sha=\$\{expectedSha\}/,
  );
  assert.match(workflow, /"Exact main SHA: " \+ expectedSha/);
});
