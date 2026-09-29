import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-ai-queue.yml", "utf8");
const orchestrator = readFileSync(".github/workflows/almago-master-orchestrator.yml", "utf8");

test("AI task queue is explicitly free-only and accepts Gemini or Groq", () => {
  assert.match(workflow, /ALMAGO_AI_FREE_ONLY/);
  assert.match(workflow, /GEMINI_API_KEY/);
  assert.match(workflow, /GROQ_API_KEY/);
  assert.doesNotMatch(workflow, /ALMAGO_AI_BILLING_CAP_CONFIRMED/);
  assert.doesNotMatch(workflow, /XAI_API_KEY/);
});

test("AI task queue keeps a bounded daily cap above two tasks", () => {
  assert.match(workflow, /MAX_DAILY_TASKS \|\| "10"/);
  assert.match(workflow, /Math\.min\(12/);
});

test("temporary free-provider exhaustion returns the task to ready instead of blocking it", () => {
  assert.match(workflow, /status="\$\?"/);
  assert.match(workflow, /"\$status" -eq 75/);
  assert.match(workflow, /labels: \["almago-ai-ready"\]/);
  assert.match(workflow, /steps\.provider\.outputs\.retryable == 'true'/);
  assert.match(workflow, /needs\.propose\.outputs\.deliver == 'true'/);
});

test("master orchestrator uses the same free-only gate", () => {
  assert.match(orchestrator, /ALMAGO_AI_FREE_ONLY/);
  assert.doesNotMatch(orchestrator, /ALMAGO_AI_BILLING_CAP_CONFIRMED/);
  assert.match(orchestrator, /Gemini\/Groq free worker/);
});
