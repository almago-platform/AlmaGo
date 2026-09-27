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

test("runbook records dashboard-vs-blueprint drift instead of assuming sync", () => {
  assert.match(runbook, /live Render dashboard configuration is authoritative/i);
  assert.match(runbook, /Known configuration drift/);
  assert.match(runbook, /service-level health check path: currently empty/);
  assert.match(runbook, /Track this operational fix in GitHub issue #389/);
  assert.match(runbook, /Do not upgrade the plan automatically/);
});

test("observability activation now targets Render rather than Vercel", () => {
  assert.match(observability, /Render environment variables and GitHub Actions secrets/);
  assert.match(observability, /keep Render as the canonical runtime/);
  assert.doesNotMatch(observability, /Vercel runtime context/);
});
