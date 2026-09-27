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
  assert.match(workflow, /confirm_delete:/);
  assert.match(workflow, /DELETE_MERGED_BRANCHES/);
  assert.match(workflow, /if \(!dryRun && confirmation !== "DELETE_MERGED_BRANCHES"\)/);
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

test("merged branch cleanup requires an explicit branch@sha manifest for deletion", () => {
  assert.match(workflow, /branch_specs:/);
  assert.match(workflow, /const requested = new Map\(\)/);
  assert.match(workflow, /\^\(\.\+\)@\(\[0-9a-fA-F\]\{40\}\)\$/);
  assert.match(workflow, /Deletion mode requires at least one explicit branch@sha entry/);
  assert.match(workflow, /Requested branch_specs failed validation/);
});

test("merged branch cleanup caps destructive batches and rechecks every tip", () => {
  assert.match(workflow, /const maxDeletePerRun = 20/);
  assert.match(workflow, /requested\.size > maxDeletePerRun/);
  assert.match(workflow, /eligible\.length > maxDeletePerRun/);
  assert.match(workflow, /const freshSha = freshRef\.data\.object\.sha/);
  assert.match(workflow, /if \(freshSha !== candidate\.sha\)/);
  assert.match(workflow, /Branch tip changed during deletion preflight/);
});

test("merged branch cleanup never deletes archive or backup refs", () => {
  assert.match(
    workflow,
    /const permanentlyExcludedPrefixes = \["archive\/", "backup\/"\]/,
  );
});
