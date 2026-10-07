import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  new URL("../.github/workflows/almago-merged-branch-cleanup.yml", import.meta.url),
  "utf8",
);

test("merged branch cleanup is manual and dry-run by default", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\bpush:\s*\n/);
  assert.match(workflow, /default:\s*dry-run/);
  assert.match(workflow, /options:[\s\S]*- dry-run[\s\S]*- delete/);
  assert.match(workflow, /const execute = requestedMode === "delete"/);
});

test("merged branch cleanup protects active and archive refs", () => {
  assert.match(workflow, /const openHeads = new Set/);
  assert.match(workflow, /const openBases = new Set/);
  assert.match(workflow, /openHeads\.has\(branch\)/);
  assert.match(workflow, /openBases\.has\(branch\)/);
  assert.match(workflow, /protectedPrefixes = \["archive\/", "backup\/"\]/);
});

test("merged branch cleanup requires the current tip to equal a merged PR head", () => {
  assert.match(workflow, /shas\.add\(pr\.head\.sha\)/);
  assert.match(workflow, /const currentSha = currentRef\.data\.object\.sha/);
  assert.match(workflow, /knownMergedShas\?\.has\(currentSha\)/);
  assert.match(workflow, /tip-moved-after-merge/);
  assert.match(workflow, /const freshSha = freshRef\.object\.sha/);
  assert.match(workflow, /freshSha !== currentSha/);
  assert.match(workflow, /tip-changed-before-delete/);
  assert.match(workflow, /github\.rest\.git\.deleteRef/);
});

test("merged branch cleanup reports eligible, deleted, and skipped refs", () => {
  assert.match(workflow, /Eligible \(\$\{planned\.length\}\)/);
  assert.match(workflow, /Deleted \(\$\{deleted\.length\}\)/);
  assert.match(workflow, /Skipped \(\$\{skipped\.length\}\)/);
});
