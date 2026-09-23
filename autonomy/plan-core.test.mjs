import assert from "node:assert/strict";
import test from "node:test";
import { loadPlan, validatePlan, nextEligibleTask, routeTask, taskIssueBody, progress, dispatchableReadyIssue } from "./plan-core.mjs";

const plan = loadPlan();

test("master plan has 45 tasks and 6 extensions", () => {
  assert.equal(validatePlan(plan), true);
  assert.equal(plan.tasks.length, 45);
  assert.equal(plan.extensions.length, 6);
});

test("first unfinished task is A09", () => {
  assert.equal(nextEligibleTask(plan, [])?.id, "A09");
});

test("active implementation issue prevents parallel implementation work", () => {
  const issue = { state: "open", body: "<!-- almago-plan-task:A09 -->", labels: [{ name: "almago-ai-ready" }] };
  assert.equal(nextEligibleTask(plan, [issue]), null);
});

test("Codex-required queue does not freeze unrelated safe plan work", () => {
  const codexIssue = {
    state: "open",
    body: "<!-- almago-plan-task:A13 -->",
    labels: [{ name: "almago-codex-required" }],
  };
  const completedA09 = {
    state: "closed",
    body: "<!-- almago-plan-task:A09 -->",
    labels: [{ name: "almago-plan-done" }],
  };
  const completedA10 = {
    state: "closed",
    body: "<!-- almago-plan-task:A10 -->",
    labels: [{ name: "almago-plan-done" }],
  };
  const next = nextEligibleTask(plan, [codexIssue, completedA09, completedA10]);
  assert.equal(next?.id, "A17");
  assert.equal(routeTask(next), "ai");
});

test("human-required queue does not freeze unrelated safe plan work", () => {
  const humanIssue = {
    state: "open",
    body: "<!-- almago-plan-task:A38 -->",
    labels: [{ name: "almago-human-required" }],
  };
  const next = nextEligibleTask(plan, [humanIssue]);
  assert.equal(next?.id, "A09");
});

test("closing A09 unlocks A10", () => {
  const issue = { state: "closed", body: "<!-- almago-plan-task:A09 -->", labels: [{ name: "almago-plan-done" }] };
  assert.equal(nextEligibleTask(plan, [issue])?.id, "A10");
});

test("router isolates AI, Codex, human and system work", () => {
  assert.equal(routeTask(plan.tasks.find(t => t.id === "A09")), "ai");
  assert.equal(routeTask(plan.tasks.find(t => t.id === "A13")), "codex");
  assert.equal(routeTask(plan.tasks.find(t => t.id === "A38")), "human");
  assert.equal(routeTask(plan.tasks.find(t => t.id === "A39")), "system");
});

test("AI issue body remains compatible with bounded worker", () => {
  const body = taskIssueBody(plan.tasks.find(t => t.id === "A09"));
  assert.match(body, /<!-- almago-ai-task -->/);
  assert.match(body, /Files:\n- src\/app\/globals\.css/);
  assert.ok(body.length < 3000);
});

test("progress includes already completed plan work", () => {
  const result = progress(plan, []);
  assert.equal(result.total, 45);
  assert.ok(result.done >= 10);
  assert.ok(result.percent > 0 && result.percent < 100);
});

test("existing ready AI issue can be dispatched after provider activation", () => {
  const issue = {
    number: 18,
    state: "open",
    body: "<!-- almago-plan-task:A09 -->\n<!-- almago-ai-task -->",
    labels: [{ name: "almago-plan" }, { name: "almago-ai-ready" }],
  };
  const ready = dispatchableReadyIssue(plan, [issue]);
  assert.equal(ready?.issue.number, 18);
  assert.equal(ready?.task.id, "A09");
});
