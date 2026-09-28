import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  latestAutopilotLock,
  mergeCandidateDecision,
  openPrCollision,
  rulesetAllowsAutonomousMerge,
} from "./autopilot-safe-merge-core.mjs";

const head = "a".repeat(40);

function strictRuleset() {
  return {
    enforcement: "active",
    conditions: { ref_name: { include: ["~DEFAULT_BRANCH"], exclude: [] } },
    rules: [
      { type: "pull_request", parameters: {} },
      {
        type: "required_status_checks",
        parameters: {
          strict_required_status_checks_policy: true,
          required_status_checks: [{ context: "verify", integration_id: null }],
        },
      },
    ],
  };
}

function baseInput() {
  return {
    lock: {
      state: "MERGE_READY",
      merge_class: "AUTONOMOUS_SAFE",
      expected_head: head,
    },
    block: {
      base_ref: "main",
      merge_class: "AUTONOMOUS_SAFE",
      writable_paths: ["src/lib/catalog.ts"],
      forbidden_paths: [".github/**", "src/app/api/**"],
    },
    pr: {
      number: 90,
      state: "open",
      draft: false,
      merged: false,
      mergeable: true,
      title: "fix: bounded UI issue",
      head: {
        sha: head,
        repo: { full_name: "almago-platform/AlmaGo" },
      },
      base: {
        ref: "main",
        sha: "b".repeat(40),
        repo: { full_name: "almago-platform/AlmaGo" },
      },
    },
    mainHead: "b".repeat(40),
    changedFiles: ["src/lib/catalog.ts"],
    workflowRuns: [
      {
        name: "AlmaGo PR CI",
        status: "completed",
        conclusion: "success",
        updated_at: "2026-09-28T10:00:00Z",
      },
    ],
    supervisorComments: [
      {
        body: "SUPERVISOR: APPROVED\n\nReviewed HEAD: `" + head + "`",
      },
    ],
    rulesets: [strictRuleset()],
    openPrScopes: [{ pr_number: 90, files: ["src/lib/catalog.ts"] }],
  };
}

test("latest lock parser ignores non-lock comments and keeps newest valid snapshot", () => {
  const comments = [
    { body: "hello" },
    {
      body: "<!-- almago-autopilot-lock -->\n```json\n" +
        JSON.stringify({ state: "CI" }) + "\n```",
    },
    {
      body: "<!-- almago-autopilot-lock -->\n```json\n" +
        JSON.stringify({ state: "MERGE_READY" }) + "\n```",
    },
  ];
  assert.equal(latestAutopilotLock(comments).state, "MERGE_READY");
});

test("ruleset must target default branch require PR and strict verify job", () => {
  assert.equal(rulesetAllowsAutonomousMerge([strictRuleset()]), true);
  assert.equal(rulesetAllowsAutonomousMerge([{
    ...strictRuleset(),
    enforcement: "disabled",
  }]), false);

  const noStrict = strictRuleset();
  noStrict.rules[1].parameters.strict_required_status_checks_policy = false;
  assert.equal(rulesetAllowsAutonomousMerge([noStrict]), false);

  const wrongJob = strictRuleset();
  wrongJob.rules[1].parameters.required_status_checks = [{ context: "AlmaGo PR CI" }];
  assert.equal(rulesetAllowsAutonomousMerge([wrongJob]), false);
});

test("fully green exact-head noncritical candidate is eligible", () => {
  const decision = mergeCandidateDecision(baseInput());
  assert.equal(decision.eligible, true);
  assert.equal(decision.reason, "safe_autonomous_merge_candidate");
});

test("main advancement or HEAD drift blocks stale merge", () => {
  const input = baseInput();
  assert.equal(
    mergeCandidateDecision({ ...input, mainHead: "c".repeat(40) }).reason,
    "main_advanced_since_candidate",
  );

  const drift = baseInput();
  drift.pr.head.sha = "d".repeat(40);
  assert.equal(mergeCandidateDecision(drift).reason, "head_mismatch");
});

test("ruleset supervisor and canonical CI are independently mandatory", () => {
  const noRules = baseInput();
  noRules.rulesets = [];
  assert.equal(
    mergeCandidateDecision(noRules).reason,
    "main_ruleset_missing_strict_ci_requirement",
  );

  const noCi = baseInput();
  noCi.workflowRuns = [{
    name: "AlmaGo PR CI",
    status: "completed",
    conclusion: "failure",
    updated_at: "2026-09-28T10:00:00Z",
  }];
  assert.equal(mergeCandidateDecision(noCi).reason, "canonical_ci_not_green");

  const noSupervisor = baseInput();
  noSupervisor.supervisorComments = [];
  assert.equal(
    mergeCandidateDecision(noSupervisor).reason,
    "supervisor_not_approved_for_head",
  );
});

test("UI changes require Browser Quality while non-UI files do not", () => {
  const ui = baseInput();
  ui.block.writable_paths = ["src/components/ui/Button.tsx"];
  ui.changedFiles = ["src/components/ui/Button.tsx"];
  ui.openPrScopes = [{ pr_number: 90, files: ["src/components/ui/Button.tsx"] }];
  assert.equal(
    mergeCandidateDecision(ui).reason,
    "browser_quality_not_green",
  );

  ui.workflowRuns.push({
    name: "AlmaGo Browser Quality",
    status: "completed",
    conclusion: "success",
    updated_at: "2026-09-28T10:01:00Z",
  });
  assert.equal(mergeCandidateDecision(ui).eligible, true);

  const nonUi = baseInput();
  assert.equal(mergeCandidateDecision(nonUi).eligible, true);
});

test("critical path scope drift conflicts and other PR collisions block merge", () => {
  const critical = baseInput();
  critical.block.writable_paths = ["src/app/api/private/route.ts"];
  critical.changedFiles = ["src/app/api/private/route.ts"];
  assert.equal(
    mergeCandidateDecision(critical).reason,
    "scope_or_critical_path_violation",
  );

  const collision = baseInput();
  collision.workflowRuns.push({
    name: "AlmaGo Browser Quality",
    status: "completed",
    conclusion: "success",
    updated_at: "2026-09-28T10:01:00Z",
  });
  collision.openPrScopes.push({
    pr_number: 91,
    files: ["src/lib/catalog.ts"],
  });
  assert.equal(mergeCandidateDecision(collision).reason, "open_pr_collision");

  assert.equal(
    openPrCollision(90, ["src/lib/a.ts"], [{ pr_number: 91, files: ["docs/a.md"] }]),
    null,
  );
});


test("safe-merge observer is read-only and permanently dry-run", () => {
  const workflow = readFileSync(".github/workflows/almago-autopilot-safe-merge-observer.yml", "utf8");
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /pull-requests: read/);
  assert.match(workflow, /issues: read/);
  assert.match(workflow, /ALMAGO_AUTOPILOT_AUTOMERGE_DRY_RUN: "true"/);
  assert.match(workflow, /ALMAGO_AUTOPILOT_AUTOMERGE_ENABLED: "true"/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.doesNotMatch(workflow, /pull-requests: write/);
  assert.doesNotMatch(workflow, /issues: write/);
});
