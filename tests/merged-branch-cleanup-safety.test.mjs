import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-merged-branch-cleanup.yml", "utf8");

test("merged-branch cleanup is manual-only and dry-runs by default", () => {
  assert.doesNotMatch(workflow, /\n\s*push:\s*\n/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /dry_run:/);
  assert.match(workflow, /default: true/);
  assert.match(workflow, /DRY_RUN: \$\{\{ inputs\.dry_run \}\}/);
});

test("cleanup protects both heads and bases of open pull requests", () => {
  assert.match(workflow, /openRefs\.add\(pr\.head\.ref\)/);
  assert.match(workflow, /openRefs\.add\(pr\.base\.ref\)/);
  assert.match(workflow, /openRefs\.has\(branch\)/);
});

test("cleanup requires the current remote tip to equal a merged PR head", () => {
  assert.match(workflow, /mergedHeadShas/);
  assert.match(workflow, /pr\.head\.sha/);
  assert.match(workflow, /github\.rest\.git\.getRef/);
  assert.match(workflow, /ref\.data\.object\.sha/);
  assert.match(workflow, /provenMergedShas\?\.has\(currentSha\)/);
  assert.match(workflow, /does not equal a merged PR head/);
});

test("archive and backup refs stay protected and deletion is gated by dry-run", () => {
  assert.match(workflow, /protectedPrefixes = \["archive\/", "backup\/"\]/);
  assert.match(workflow, /if \(dryRun\) continue/);
  assert.match(workflow, /github\.rest\.git\.deleteRef/);
});

test("cleanup summarizes planned deleted and skipped refs", () => {
  assert.match(workflow, /Proven eligible refs/);
  assert.match(workflow, /Deleted refs/);
  assert.match(workflow, /Skipped\/protected refs/);
});
