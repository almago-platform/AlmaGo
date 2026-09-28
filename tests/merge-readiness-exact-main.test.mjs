import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-safe-automerge.yml",
  "utf8",
);

test("merge readiness only evaluates PRs against the repository default branch", () => {
  assert.match(workflow, /const mainBranch = repository\.default_branch \|\| "main"/);
  assert.match(workflow, /if \(pr\.base\.ref !== mainBranch/);
});

test("merge readiness requires the PR head to contain exact current main", () => {
  assert.match(workflow, /basehead: `\$\{mainSha\}\.\.\.\$\{headSha\}`/);
  assert.match(workflow, /comparison\.data\.behind_by/);
  assert.match(workflow, /finalComparison\.data\.behind_by/);
});

test("merge readiness rechecks both main and PR immediately before READY", () => {
  assert.match(workflow, /const \{ data: latestMain \}/);
  assert.match(workflow, /const \{ data: latestPr \}/);
  assert.match(workflow, /latestMain\.commit\.sha !== mainSha/);
  assert.match(workflow, /latestPr\.head\.sha !== headSha/);
  assert.match(workflow, /latestPr\.base\.ref !== mainBranch/);
});

test("readiness evidence is bound to both head and exact main SHA", () => {
  assert.match(
    workflow,
    /almago-merge-ready:head=\$\{headSha\};main=\$\{mainSha\}/,
  );
  assert.match(workflow, /`Exact main SHA: \$\{mainSha\}`/);
});
