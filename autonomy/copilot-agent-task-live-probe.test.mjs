import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { validateAutopilotPlan } from "./copilot-autopilot-core.mjs";

test("live Agent Task probe plan is docs-only and never auto-merges", () => {
  const plan = JSON.parse(readFileSync("autonomy/copilot-agent-task-live-probe-plan.json", "utf8"));
  assert.equal(validateAutopilotPlan(plan), true);
  assert.equal(plan.maxConcurrentTasks, 1);
  assert.equal(plan.maxRevisionAttempts, 1);
  assert.equal(plan.noAutomaticMerge, true);
  assert.equal(plan.blocks.length, 1);

  const block = plan.blocks[0];
  assert.equal(block.block_id, "AGENT-PROBE-01");
  assert.deepEqual(block.writable_paths, ["docs/COPILOT_AGENT_TASK_LIVE_PROBE.md"]);
  assert.equal(block.merge_class, "AUTONOMOUS_SAFE");
  assert.match(block.prompt, /Do not modify any other file/);
  assert.match(block.stop_condition, /never merge automatically/i);
});

test("live probe workflow has bounded permissions and one-task limit", () => {
  const workflow = readFileSync(".github/workflows/almago-copilot-agent-task-live-probe.yml", "utf8");
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /issues: write/);
  assert.match(workflow, /pull-requests: read/);
  assert.match(workflow, /ALMAGO_COPILOT_AUTOPILOT_DRY_RUN: "false"/);
  assert.match(workflow, /ALMAGO_COPILOT_AUTOPILOT_MAX_NEW_TASKS: "1"/);
  assert.match(workflow, /copilot-agent-task-live-probe-plan\.json/);
  assert.doesNotMatch(workflow, /contents: write/);
  assert.doesNotMatch(workflow, /pull-requests: write/);
  assert.doesNotMatch(workflow, /AUTOMERGE_ENABLED/);
});
