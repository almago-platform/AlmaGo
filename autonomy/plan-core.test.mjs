import assert from "node:assert/strict";
import test from "node:test";
import { loadPlan, validatePlan, nextEligibleTask, routeTask, taskIssueBody, progress, dispatchableReadyIssue, standaloneAiReadyIssue } from "./plan-core.mjs";

const plan = loadPlan();

function planWithStatuses(overrides = {}) {
  const fixture = structuredClone(plan);
  for (const task of fixture.tasks) {
    if (Object.hasOwn(overrides, task.id)) task.status = overrides[task.id];
  }
  return fixture;
}

test("master plan has 45 tasks and 6 extensions", () => {
  assert.equal(validatePlan(plan), true);
  assert.equal(plan.tasks.length, 45);
  assert.equal(plan.extensions.length, 6);
});

test("current first unfinished task is A38", () => {
  assert.equal(nextEligibleTask(plan, [])?.id, "A38");
});

test("active implementation issue prevents parallel implementation work", () => {
  const fixture = planWithStatuses({ A09: "TODO" });
  const issue = { state: "open", body: "<!-- almago-plan-task:A09 -->", labels: [{ name: "almago-ai-ready" }] };
  assert.equal(nextEligibleTask(fixture, [issue]), null);
});

test("Codex-required queue does not freeze unrelated safe plan work", () => {
  const fixture = planWithStatuses({ A13: "TODO", A17: "TODO" });
  const codexIssue = {
    state: "open",
    body: "<!-- almago-plan-task:A13 -->",
    labels: [{ name: "almago-codex-required" }],
  };
  const next = nextEligibleTask(fixture, [codexIssue]);
  assert.equal(next?.id, "A17");
  assert.equal(routeTask(next), "ai");
});

test("human-required queue does not freeze unrelated safe plan work", () => {
  const fixture = planWithStatuses({ A09: "TODO" });
  const humanIssue = {
    state: "open",
    body: "<!-- almago-plan-task:A38 -->",
    labels: [{ name: "almago-human-required" }],
  };
  const next = nextEligibleTask(fixture, [humanIssue]);
  assert.equal(next?.id, "A09");
});

test("closing A09 unlocks A10", () => {
  const fixture = planWithStatuses({ A09: "TODO", A10: "TODO" });
  const issue = { state: "closed", body: "<!-- almago-plan-task:A09 -->", labels: [{ name: "almago-plan-done" }] };
  assert.equal(nextEligibleTask(fixture, [issue])?.id, "A10");
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


test("standalone bounded AI-ready issues can feed the five-minute worker", () => {
  const ready = {
    number: 520,
    state: "open",
    body: "<!-- almago-ai-task -->\nFiles:\n- src/components/student/DocumentsPanel.tsx\nGoal: polish Arabic UX.",
    labels: [{ name: "almago-ai-ready" }],
  };
  assert.equal(standaloneAiReadyIssue([ready])?.number, 520);
  assert.equal(standaloneAiReadyIssue([{ ...ready, body: "<!-- almago-plan-task:A01 -->" }]), null);
  assert.equal(standaloneAiReadyIssue([{ ...ready, labels: [{ name: "almago-ai-running" }, { name: "almago-ai-ready" }] }]), null);
  assert.equal(standaloneAiReadyIssue([{ ...ready, labels: [{ name: "almago-ai-blocked" }, { name: "almago-ai-ready" }] }]), null);
  assert.equal(standaloneAiReadyIssue([{ ...ready, body: "missing task marker" }]), null);
});
