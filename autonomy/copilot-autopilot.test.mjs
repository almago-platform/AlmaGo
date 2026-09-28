import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AGENT_TASK_MODELS, startAgentTask } from "./copilot-agent-client.mjs";
import {
  agentTaskPullRequestNumber,
  normalizePath,
  pathsOverlap,
  pathMatchesPattern,
  scopeAssessment,
  collidesWithLocks,
  validateAutopilotPlan,
  mapAgentTaskState,
  reconciledPullRequestNumber,
  leaseExpired,
  selectEligibleBlocks,
  browserQualityRequirement,
  checksValidForHead,
  workflowResult,
  supervisorDecisionForHead,
  canRevise,
  mergeReadiness,
  lifecycleDecision,
} from "./copilot-autopilot-core.mjs";

const plan = JSON.parse(readFileSync(new URL("./copilot-autopilot-plan.json", import.meta.url), "utf8"));

test("plan validates and contains sandbox plus LOT7 through LOT19", () => {
  assert.equal(validateAutopilotPlan(plan), true);
  assert.equal(plan.blocks[0].block_id, "SANDBOX-01");
  for (let lot = 7; lot <= 19; lot++) {
    assert.ok(plan.blocks.some((block) => block.lot === "LOT" + lot));
  }
});

test("paths normalize and collisions fail closed", () => {
  assert.equal(normalizePath("./src\\app//x"), "src/app/x");
  assert.equal(pathsOverlap("src/app/**", "src/app/student/page.tsx"), true);
  assert.equal(pathsOverlap("src/lib/a.ts", "docs/a.md"), false);
});

test("path contracts distinguish exact files from bounded globs", () => {
  assert.equal(pathMatchesPattern("docs/a.md", "docs/a.md"), true);
  assert.equal(pathMatchesPattern("docs/b.md", "docs/a.md"), false);
  assert.equal(pathMatchesPattern("docs/nested/a.md", "docs/**"), true);
  assert.deepEqual(
    scopeAssessment(
      { writable_paths: ["docs/**"], forbidden_paths: [".github/**"] },
      ["docs/a.md", "docs/nested/b.md"],
    ),
    { scopeExact: true, forbiddenTouched: false },
  );
  assert.deepEqual(
    scopeAssessment(
      { writable_paths: ["docs/**"], forbidden_paths: [".github/**"] },
      ["docs/a.md", ".github/workflows/x.yml"],
    ),
    { scopeExact: false, forbiddenTouched: true },
  );
});

test("active locks block only overlapping work", () => {
  const lock = { state: "IN_PROGRESS", writable_paths: ["src/app/student/**"] };
  assert.equal(collidesWithLocks({ writable_paths: ["src/app/student/x.tsx"] }, [lock]), true);
  assert.equal(collidesWithLocks({ writable_paths: ["docs/**"] }, [lock]), false);
});

test("leases expire deterministically", () => {
  assert.equal(
    leaseExpired({ lease_expires_at: "2026-01-01T00:00:00Z" }, Date.parse("2026-01-02T00:00:00Z")),
    true,
  );
});

test("unknown Agent Task states are rejected", () => {
  assert.equal(mapAgentTaskState("queued"), "QUEUED");
  assert.throws(() => mapAgentTaskState("mystery"));
});

test("scheduler respects dependencies and human gates", () => {
  const template = plan.blocks[0];
  const custom = {
    ...plan,
    maxConcurrentTasks: 3,
    blocks: [
      { ...template, block_id: "A", depends_on: [], enabled: true },
      { ...template, block_id: "B", depends_on: ["A"], enabled: true },
      { ...template, block_id: "C", depends_on: [], enabled: true, merge_class: "HUMAN_GATE" },
    ],
  };
  assert.deepEqual(selectEligibleBlocks(custom, new Map(), []).map((item) => item.block_id), ["A"]);
  assert.deepEqual(
    selectEligibleBlocks(custom, new Map([["A", "DONE"]]), []).map((item) => item.block_id),
    ["B"],
  );
});

test("browser quality supports strict not-applicable classification", () => {
  assert.equal(browserQualityRequirement(["src/components/X.tsx"]), "REQUIRED");
  assert.equal(browserQualityRequirement(["autonomy/x.mjs", "docs/a.md"]), "NOT_APPLICABLE");
});

test("HEAD changes invalidate check evidence", () => {
  assert.equal(checksValidForHead([{ head_sha: "a" }], "a"), true);
  assert.equal(checksValidForHead([{ head_sha: "a" }], "b"), false);
});

test("workflow evidence stays pending until the named latest run completes", () => {
  assert.equal(workflowResult([], "AlmaGo PR CI"), "PENDING");
  assert.equal(workflowResult([{ name: "AlmaGo PR CI", status: "in_progress" }], "AlmaGo PR CI"), "PENDING");
  assert.equal(
    workflowResult([{ name: "AlmaGo PR CI", status: "completed", conclusion: "success" }], "AlmaGo PR CI"),
    "SUCCESS",
  );
  assert.equal(
    workflowResult([{ name: "AlmaGo PR CI", status: "completed", conclusion: "failure" }], "AlmaGo PR CI"),
    "FAILURE",
  );
  assert.equal(
    workflowResult([{ name: "AlmaGo PR CI", status: "completed", conclusion: "action_required" }], "AlmaGo PR CI"),
    "ACTION_REQUIRED",
  );
});

test("supervisor evidence must bind to the exact reviewed HEAD", () => {
  const a = "a".repeat(40);
  const b = "b".repeat(40);
  const comments = [{
    body: `SUPERVISOR: APPROVED\n\nReviewed HEAD: \`${a}\`\n\nLooks good.`,
  }];
  assert.equal(supervisorDecisionForHead(comments, b), null);
  assert.equal(supervisorDecisionForHead(comments, a)?.decision, "APPROVED");
});

test("revision attempts are bounded", () => {
  assert.equal(canRevise({ revision_attempts: 2 }, 3), true);
  assert.equal(canRevise({ revision_attempts: 3 }, 3), false);
});

test("merge readiness remains fail closed", () => {
  const block = { ...plan.blocks[0], writable_paths: ["docs/**"], merge_class: "AUTONOMOUS_SAFE" };
  const good = {
    block,
    headMatches: true,
    baseMatches: true,
    ci: "SUCCESS",
    browser: "NOT_APPLICABLE",
    supervisor: "APPROVED",
    scopeExact: true,
    forbiddenTouched: false,
    conflict: false,
  };
  assert.equal(mergeReadiness(good), "MERGE_READY");
  assert.equal(mergeReadiness({ ...good, ci: "FAILURE" }), "BLOCKED");
  assert.equal(mergeReadiness({ ...good, block: { ...block, merge_class: "HUMAN_GATE" } }), "HUMAN_GATE");
});

test("lifecycle advances CI -> review -> merge-ready and completes only after merge", () => {
  const block = { ...plan.blocks[0], writable_paths: ["docs/**"], merge_class: "AUTONOMOUS_SAFE" };
  const base = {
    block,
    lock: { revision_attempts: 0 },
    prOpen: true,
    prMerged: false,
    headMatches: true,
    baseMatches: true,
    ci: "SUCCESS",
    browser: "NOT_APPLICABLE",
    supervisor: null,
    scopeExact: true,
    forbiddenTouched: false,
    conflict: false,
  };
  assert.deepEqual(lifecycleDecision(base).state, "REVIEW");
  assert.deepEqual(lifecycleDecision({ ...base, supervisor: "APPROVED" }).state, "MERGE_READY");
  assert.deepEqual(lifecycleDecision({ ...base, prOpen: false, prMerged: true }).state, "DONE");
});


test("workflow approval requirements stop at a human gate instead of spending revisions", () => {
  const block = { ...plan.blocks[0], writable_paths: ["docs/**"], merge_class: "AUTONOMOUS_SAFE" };
  const base = {
    block,
    lock: { revision_attempts: 0 },
    prOpen: true,
    prMerged: false,
    headMatches: true,
    baseMatches: true,
    ci: "ACTION_REQUIRED",
    browser: "NOT_APPLICABLE",
    supervisor: null,
    scopeExact: true,
    forbiddenTouched: false,
    conflict: false,
    maxRevisionAttempts: 3,
  };

  assert.deepEqual(lifecycleDecision(base), {
    state: "HUMAN_GATE",
    action: "STOP",
    reason: "GitHub workflow approval is required before canonical validation can run",
  });
  assert.equal(
    lifecycleDecision({ ...base, ci: "SUCCESS", browser: "ACTION_REQUIRED" }).state,
    "HUMAN_GATE",
  );
});

test("lifecycle sends bounded revisions and stops at the revision budget", () => {
  const block = { ...plan.blocks[0], writable_paths: ["docs/**"], merge_class: "AUTONOMOUS_SAFE" };
  const base = {
    block,
    lock: { revision_attempts: 2 },
    prOpen: true,
    prMerged: false,
    headMatches: true,
    baseMatches: true,
    ci: "FAILURE",
    browser: "NOT_APPLICABLE",
    supervisor: null,
    scopeExact: true,
    forbiddenTouched: false,
    conflict: false,
    maxRevisionAttempts: 3,
  };
  assert.deepEqual(lifecycleDecision(base).action, "REVISE");
  assert.deepEqual(
    lifecycleDecision({ ...base, lock: { revision_attempts: 3 } }).state,
    "HUMAN_GATE",
  );
});

test("scope or branch contract violations stop instead of auto-revising", () => {
  const block = { ...plan.blocks[0], writable_paths: ["docs/**"], merge_class: "AUTONOMOUS_SAFE" };
  const base = {
    block,
    lock: { revision_attempts: 0 },
    prOpen: true,
    prMerged: false,
    headMatches: true,
    baseMatches: true,
    ci: "SUCCESS",
    browser: "NOT_APPLICABLE",
    supervisor: "APPROVED",
    scopeExact: true,
    forbiddenTouched: false,
    conflict: false,
  };
  assert.equal(lifecycleDecision({ ...base, forbiddenTouched: true }).state, "BLOCKED");
  assert.equal(lifecycleDecision({ ...base, headMatches: false }).state, "BLOCKED");
});

test("supported model set fails closed without Auto", () => {
  assert.ok(AGENT_TASK_MODELS.has("gpt-5.3-codex"));
  assert.equal(AGENT_TASK_MODELS.has("auto"), false);
});

test("Agent Tasks launch sends only documented bounded fields", async () => {
  let received;
  const fakeFetch = async (_url, options) => {
    received = JSON.parse(options.body);
    return {
      ok: true,
      status: 201,
      json: async () => ({ id: "task-1", state: "queued" }),
      text: async () => "",
    };
  };
  await startAgentTask({
    owner: "o",
    repo: "r",
    token: "secret",
    prompt: "p",
    baseRef: "main",
    model: "gpt-5.3-codex",
    customAgent: "almago-gemini-ux",
    fetchImpl: fakeFetch,
  });
  assert.deepEqual(
    Object.keys(received).sort(),
    ["prompt", "base_ref", "model", "custom_agent", "create_pull_request"].sort(),
  );
  assert.equal(received.create_pull_request, true);
});

test("revision task reuses the existing PR branch without creating a new PR", async () => {
  let received;
  const fakeFetch = async (_url, options) => {
    received = JSON.parse(options.body);
    return {
      ok: true,
      status: 201,
      json: async () => ({ id: "task-2", state: "queued" }),
      text: async () => "",
    };
  };
  await startAgentTask({
    owner: "o",
    repo: "r",
    token: "secret",
    prompt: "revise",
    baseRef: "main",
    headRef: "copilot/existing",
    model: "gpt-5.3-codex",
    createPullRequest: false,
    fetchImpl: fakeFetch,
  });
  assert.equal(received.head_ref, "copilot/existing");
  assert.equal(received.create_pull_request, false);
});

test("missing token is rejected before network access", async () => {
  await assert.rejects(() => startAgentTask({
    owner: "o",
    repo: "r",
    token: "",
    prompt: "p",
    baseRef: "main",
    model: "gpt-5.3-codex",
    fetchImpl: async () => { throw new Error("network should not run"); },
  }), /TOKEN is required/);
});


test("Agent Task pull artifact uses public PR number, never GitHub database id", () => {
  const task = {
    artifacts: [{
      provider: "github",
      type: "pull",
      data: { id: 4663451678, number: 496 },
    }],
  };
  assert.equal(agentTaskPullRequestNumber(task), 496);
  assert.equal(agentTaskPullRequestNumber({
    artifacts: [{ provider: "github", type: "pull", data: { id: 4663451678 } }],
  }), null);
});

test("head-ref PR resolution replaces stale internal IDs and fails closed when unresolved", () => {
  assert.equal(reconciledPullRequestNumber({
    resolvedByHead: 496,
    artifactNumber: null,
    priorPullNumber: 4663451678,
    hasHeadRef: true,
  }), 496);

  assert.equal(reconciledPullRequestNumber({
    resolvedByHead: null,
    artifactNumber: null,
    priorPullNumber: 4663451678,
    hasHeadRef: true,
  }), null);

  assert.equal(reconciledPullRequestNumber({
    resolvedByHead: null,
    artifactNumber: 496,
    priorPullNumber: 4663451678,
    hasHeadRef: true,
  }), null);

  assert.equal(reconciledPullRequestNumber({
    resolvedByHead: null,
    artifactNumber: 496,
    priorPullNumber: 4663451678,
    hasHeadRef: false,
  }), 496);

  assert.equal(reconciledPullRequestNumber({
    resolvedByHead: null,
    artifactNumber: null,
    priorPullNumber: 496,
    hasHeadRef: false,
  }), 496);
});
