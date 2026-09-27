import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-merged-branch-cleanup.yml",
  "utf8",
);

test("merged branch cleanup is manual and dry-run by default", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /dry_run:/);
  assert.match(workflow, /default:\s*true/);
  assert.doesNotMatch(workflow, /\n\s{2}push:/);
});

test("merged branch cleanup protects open PR heads and bases", () => {
  assert.match(workflow, /const openHeads = new Set/);
  assert.match(workflow, /const openBases = new Set/);
  assert.match(workflow, /openHeads\.has\(branch\)/);
  assert.match(workflow, /openBases\.has\(branch\)/);
});

test("merged branch cleanup requires the current tip to equal a merged PR head", () => {
  assert.match(workflow, /const currentSha = currentRef\.data\.object\.sha/);
  assert.match(workflow, /pr\.head\.sha === currentSha/);
  assert.match(workflow, /if \(!exactMergedHead\)/);
  assert.match(
    workflow,
    /Skipped because current tip no longer matches a merged PR head/,
  );
});

test("merged branch cleanup never deletes archive or backup refs", () => {
  assert.match(
    workflow,
    /const permanentlyExcludedPrefixes = \["archive\/", "backup\/"\]/,
  );
});
