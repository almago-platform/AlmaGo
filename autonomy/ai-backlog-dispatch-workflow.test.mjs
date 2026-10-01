import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-ai-backlog-dispatch.yml", "utf8");

test("AI backlog dispatcher is manual-only during Partner-Ready Calm Mode", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.doesNotMatch(workflow, /\n  schedule:/);
  assert.doesNotMatch(workflow, /\n  push:/);
  assert.doesNotMatch(workflow, /\n  issues:/);
});

test("AI backlog dispatcher preserves provider and duplicate-run gates", () => {
  assert.match(workflow, /ALMAGO_AI_ENABLED/);
  assert.match(workflow, /ALMAGO_AI_FREE_ONLY/);
  assert.match(workflow, /listWorkflowRuns/);
  assert.match(workflow, /queued/);
  assert.match(workflow, /in_progress/);
});

test("AI backlog dispatcher only sends bounded standalone ready tasks to the existing queue", () => {
  assert.match(workflow, /labels: "almago-ai-ready"/);
  assert.match(workflow, /<!-- almago-ai-task -->/);
  assert.match(workflow, /<!-- almago-plan-task:/);
  assert.match(workflow, /workflow_id: "almago-ai-queue\.yml"/);
  assert.match(workflow, /inputs: \{ issue_number: String\(task\.number\) \}/);
});


test("AI backlog dispatcher never requires a paid billing confirmation gate", () => {
  assert.doesNotMatch(workflow, /ALMAGO_AI_BILLING_CAP_CONFIRMED/);
});
