import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const renderYaml = readFileSync("render.yaml", "utf8");
const runbook = readFileSync("docs/render-runbook.md", "utf8");
const observability = readFileSync("docs/observability.md", "utf8");

test("Render blueprint keeps the production health and auto-deploy contract", () => {
  assert.match(renderYaml, /healthCheckPath:\s*\/api\/health/);
  assert.match(renderYaml, /autoDeployTrigger:\s*commit/);
  assert.match(renderYaml, /region:\s*frankfurt/);
  assert.match(renderYaml, /runtime:\s*node/);
});

test("runbook records the current Render operating contract", () => {
  assert.match(runbook, /dashboard Render reste la source de vérité/i);
  assert.match(runbook, /health check\s*:\s*`\/api\/health`/i);
  assert.match(runbook, /auto-deploy\s*:\s*activé/i);
  assert.match(runbook, /préférer un revert Git/i);
  assert.doesNotMatch(runbook, /Vercel/i);
});

test("observability keeps Render as the canonical runtime boundary", () => {
  assert.match(observability, /Render environment variables and GitHub Actions secrets/);
  assert.match(observability, /logs Render\/Supabase/i);
  assert.doesNotMatch(observability, /Vercel runtime context/i);
});
