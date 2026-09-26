import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { AGENT_TASK_MODELS, startAgentTask } from "./copilot-agent-client.mjs";
import {
  normalizePath,
  pathsOverlap,
  collidesWithLocks,
  validateAutopilotPlan,
  mapAgentTaskState,
  leaseExpired,
  selectEligibleBlocks,
  browserQualityRequirement,
  checksValidForHead,
  canRevise,
  mergeReadiness,
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
