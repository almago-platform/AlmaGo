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

test("destructive cleanup requires explicit branch@sha manifest and confirmation", () => {
  assert.match(workflow, /branch_specs:/);
  assert.match(workflow, /confirm_delete:/);
  assert.match(workflow, /DELETE_MERGED_BRANCHES/);
  assert.match(workflow, /const maxDeletePerRun = 20/);
  assert.match(workflow, /\^\(\.\+\)@\(\[0-9a-fA-F\]\{40\}\)\$/);
  assert.match(workflow, /Deletion mode requires at least one explicit branch@sha entry/);
  assert.match(workflow, /requested\.size > maxDeletePerRun/);
});

test("cleanup only discovers historically approved branch prefixes", () => {
  for (const prefix of [
    "codex/",
    "design/",
    "phase5/",
    "hardening/",
    "feat/",
    "automation/",
    "chore/",
    "plan/",
    "ci/",
    "docs/",
    "fix/",
    "test/",
    "dependabot/",
  ]) {
    assert.match(workflow, new RegExp(prefix.replace("/", "\\/")));
  }
  assert.match(workflow, /permanentlyExcludedPrefixes = \["archive\/", "backup\/"\]/);
});

test("cleanup protects open PR heads and bases and requires exact merged tips", () => {
  assert.match(workflow, /heads: new Set/);
  assert.match(workflow, /bases: new Set/);
  assert.match(workflow, /openHeads\.has\(branch\)/);
  assert.match(workflow, /openBases\.has\(branch\)/);
  assert.match(workflow, /String\(pr\.head\.sha\)\.toLowerCase\(\) === currentSha/);
  assert.match(workflow, /tip no longer matches a merged PR head/);
});

test("the whole manifest validates before the first delete", () => {
  const fullPreflight = workflow.indexOf("Validate the entire requested set immediately before any destructive");
  const deleteCall = workflow.indexOf("github.rest.git.deleteRef");
  assert.ok(fullPreflight >= 0);
  assert.ok(deleteCall > fullPreflight);
  assert.match(workflow, /preDeleteOpenHeads\.has\(candidate\.branch\)/);
  assert.match(workflow, /preDeleteOpenBases\.has\(candidate\.branch\)/);
  assert.match(workflow, /validationSha !== candidate\.sha/);
});

test("each branch rechecks open PR activity and SHA immediately before deletion", () => {
  assert.match(workflow, /Re-list PRs and re-read the ref immediately before each deletion/);
  assert.match(workflow, /const freshOpenPulls = await listOpenPulls\(\)/);
  assert.match(workflow, /freshOpenHeads\.has\(candidate\.branch\)/);
  assert.match(workflow, /freshOpenBases\.has\(candidate\.branch\)/);
  assert.match(workflow, /freshSha !== candidate\.sha/);
  assert.match(workflow, /Branch no longer matches a merged PR head/);
  assert.match(workflow, /github\.rest\.git\.deleteRef/);
});

test("dry-run can discover all eligible refs while an explicit manifest narrows the run", () => {
  assert.match(workflow, /requested\.size > 0[\s\S]*requested\.keys\(\)[\s\S]*discoveredEligible/);
  assert.match(workflow, /Mode: \$\{execute \? "DELETE" : "DRY RUN"\}/);
  assert.match(workflow, /Explicit branch specs:/);
  assert.match(workflow, /Eligible in this run:/);
  assert.match(workflow, /Deleted:/);
});
