import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const renderYaml = readFileSync("render.yaml", "utf8");
const runbook = readFileSync("docs/render-runbook.md", "utf8");
const observability = readFileSync("docs/observability.md", "utf8");

test("Render blueprint keeps the intended health and auto-deploy contract", () => {
  assert.match(renderYaml, /healthCheckPath:\s*\/api\/health/);
  assert.match(renderYaml, /autoDeployTrigger:\s*commit/);
  assert.match(renderYaml, /region:\s*frankfurt/);
  assert.match(renderYaml, /runtime:\s*node/);
});

test("runbook records the resolved live Render contract without assuming blueprint ownership", () => {
  assert.match(runbook, /dashboard.*source de vérité/i);
  assert.match(runbook, /Health Check Path.*\/api\/health/i);
  assert.match(runbook, /auto-deploy.*activé/i);
  assert.match(runbook, /new_commit/);
  assert.match(runbook, /#389.*résolu/i);
  assert.match(runbook, /plan.*Free/i);
  assert.match(runbook, /décision propriétaire/i);
});

test("observability activation targets Render rather than Vercel", () => {
  assert.match(observability, /Render environment variables and GitHub Actions secrets/);
  assert.match(observability, /keep Render as the canonical runtime/);
  assert.doesNotMatch(observability, /Vercel runtime context/);
});
