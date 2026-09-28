import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-a38-human-approval.yml",
  "utf8",
);

test("A38 re-reads main and the issue immediately before completion", () => {
  assert.match(workflow, /const \[\{ data: finalMain \}, \{ data: finalIssue \}\]/);
  assert.match(workflow, /finalMain\.commit\.sha !== sha/);
  assert.match(workflow, /main changed after readiness\/approval validation/);
});

test("A38 completion uses one issue update for labels and closed state", () => {
  assert.match(workflow, /finalLabels\.add\("almago-plan-done"\)/);
  assert.match(workflow, /finalLabels\.delete\("almago-human-required"\)/);
  assert.match(workflow, /finalLabels\.delete\("almago-ai-blocked"\)/);
  assert.match(workflow, /labels: \[\.\.\.finalLabels\]/);
  assert.match(workflow, /state: "closed"/);
  assert.doesNotMatch(workflow, /issues\.addLabels/);
  assert.doesNotMatch(workflow, /issues\.removeLabel/);
});

test("A38 human evidence remains bound to the validated SHA", () => {
  assert.match(
    workflow,
    /almago-a38-human-approved:sha=\$\{sha\};comment=\$\{comment\.id\}/,
  );
  assert.match(workflow, /"Exact main SHA: " \+ sha/);
});
