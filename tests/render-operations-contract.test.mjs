import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const renderYaml = readFileSync("render.yaml", "utf8");
const archivedRunbook = readFileSync("docs/render-runbook.md", "utf8");
const vpsRunbook = readFileSync("docs/vps-runbook.md", "utf8");
const observability = readFileSync("docs/observability.md", "utf8");

test("legacy Render blueprint remains as historical configuration only", () => {
  assert.match(renderYaml, /healthCheckPath:\s*\/api\/health/);
  assert.match(archivedRunbook, /suspendu le 08\/10\/2026/i);
  assert.match(archivedRunbook, /n'est plus le runtime de production canonique/i);
});

test("runbook records the current Ubuntu VPS operating contract", () => {
  assert.match(vpsRunbook, /https:\/\/campusallemagne\.tn/);
  assert.match(vpsRunbook, /almago-autodeploy\.timer/);
  assert.match(vpsRunbook, /127\.0\.0\.1:3000/);
  assert.match(vpsRunbook, /git rev-parse --verify HEAD/);
  assert.match(vpsRunbook, /préfixe de 12 caractères/i);
  assert.match(vpsRunbook, /Privilégier un revert Git/i);
});

test("observability keeps VPS as the canonical runtime boundary", () => {
  assert.match(observability, /VPS environment variables and GitHub Actions secrets/);
  assert.match(observability, /logs Nginx\/Next\.js du VPS et Supabase/i);
  assert.doesNotMatch(observability, /Vercel runtime context/i);
});
