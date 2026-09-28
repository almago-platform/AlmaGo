import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-final-release-gate.yml",
  "utf8",
);

test("A45 requires SHA-bound evidence from A38, A43 and A44", () => {
  assert.match(workflow, /almago-a38-human-approved:sha=\$\{mainSha\}/);
  assert.match(workflow, /almago-a43-evidence:/);
  assert.match(workflow, /;sha=\$\{mainSha\} -->/);
  assert.match(workflow, /almago-a44-evidence:/);
  assert.match(workflow, /prerequisite evidence is missing or stale/);
});

test("A45 checks all three prerequisite evidence records", () => {
  assert.match(workflow, /const required = \["A38", "A43", "A44"\]/);
  assert.match(workflow, /for \(const id of required\)/);
  assert.match(workflow, /evidenceMatches\[id\]/);
});

test("A45 rechecks prerequisite completion and evidence before READY", () => {
  assert.match(workflow, /const finalRequired = \["A38", "A43", "A44"\]/);
  assert.match(workflow, /A45 prerequisite reopened before readiness/);
  assert.match(
    workflow,
    /A45 exact-main prerequisite evidence changed before readiness/,
  );
});

test("A45 final evidence remains tied to the captured release SHA", () => {
  assert.match(workflow, /almago-a38-human-approved:sha=\$\{sha\}/);
  assert.match(workflow, /;sha=\$\{sha\} -->/);
});
