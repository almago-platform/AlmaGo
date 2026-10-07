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

test("destructive cleanup requires an explicit capped branch@sha manifest", () => {
  assert.match(workflow, /branch_specs:/);
  assert.match(workflow, /branch\/name@40-char-sha/);
  assert.match(workflow, /const maxDeletes = 20/);
  assert.match(workflow, /\^\(\.\+\)@\(\[0-9a-f\]\{40\}\)\$/);
  assert.match(workflow, /Delete mode requires at least one explicit branch@sha spec/);
  assert.match(workflow, /requested\.length > maxDeletes/);
  assert.match(workflow, /Duplicate branch spec/);
});

test("merged branch cleanup protects active and archive refs", () => {
  assert.match(workflow, /const openHeads = new Set/);
  assert.match(workflow, /const openBases = new Set/);
  assert.match(workflow, /openHeads\.has\(branch\)/);
  assert.match(workflow, /openBases\.has\(branch\)/);
  assert.match(workflow, /protectedPrefixes = \["archive\/", "backup\/"\]/);
});

test("merged branch cleanup requires exact merged and manifest SHAs", () => {
  assert.match(workflow, /shas\.add\(String\(pr\.head\.sha\)\.toLowerCase\(\)\)/);
  assert.match(workflow, /const currentSha = String\(currentRef\.data\.object\.sha\)\.toLowerCase\(\)/);
  assert.match(workflow, /knownMergedShas\.has\(currentSha\)/);
  assert.match(workflow, /tip-moved-after-merge/);
  assert.match(workflow, /candidate\.sha !== entry\.sha/);
  assert.match(workflow, /Expected SHA mismatch/);
});

test("all requested refs validate before first delete and revalidate immediately before deletion", () => {
  const validationPass = workflow.indexOf("Complete a second validation pass");
  const deleteLoop = workflow.indexOf("for (const entry of planned)", validationPass + 1);
  const deleteCall = workflow.indexOf("github.rest.git.deleteRef");
  assert.ok(validationPass >= 0);
  assert.ok(deleteLoop > validationPass);
  assert.ok(deleteCall > deleteLoop);
  assert.match(workflow, /validationSha !== entry\.sha/);
  assert.match(workflow, /Re-read immediately before each delete/);
  assert.match(workflow, /freshSha !== entry\.sha/);
  assert.match(workflow, /Cleanup manifest drifted immediately before delete/);
});

test("merged branch cleanup reports planned, deleted, and skipped refs", () => {
  assert.match(workflow, /Explicit manifest entries:/);
  assert.match(workflow, /Eligible\/planned \(\$\{planned\.length\}\)/);
  assert.match(workflow, /Deleted \(\$\{deleted\.length\}\)/);
  assert.match(workflow, /Skipped \(\$\{skipped\.length\}\)/);
});
