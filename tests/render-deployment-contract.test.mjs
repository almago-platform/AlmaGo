import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const blueprint = readFileSync("render.yaml", "utf8");
const health = readFileSync("src/app/api/health/route.ts", "utf8");
const nodeVersion = readFileSync(".node-version", "utf8").trim();

test("Render production Blueprint uses the supported Next.js Node deployment contract", () => {
  assert.match(blueprint, /type:\s*web/);
  assert.match(blueprint, /runtime:\s*node/);
  assert.match(blueprint, /region:\s*frankfurt/);
  assert.match(blueprint, /plan:\s*1c-2g/);
  assert.match(blueprint, /buildCommand:\s*npm ci && npm run build/);
  assert.match(blueprint, /startCommand:\s*npm start/);
  assert.match(blueprint, /healthCheckPath:\s*\/api\/health/);
  assert.match(blueprint, /autoDeployTrigger:\s*commit/);
});

test("Supabase values are never committed to the Render Blueprint", () => {
  assert.match(blueprint, /NEXT_PUBLIC_SUPABASE_URL[\s\S]*sync:\s*false/);
  assert.match(blueprint, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY[\s\S]*sync:\s*false/);
  assert.doesNotMatch(blueprint, /supabase\.co/);
});

test("Render health route is independent of Supabase", () => {
  assert.match(health, /status:\s*"ok"/);
  assert.match(health, /status:\s*200/);
  assert.doesNotMatch(health, /supabase/i);
});

test("Render and CI use pinned Node 22", () => {
  assert.equal(nodeVersion, "22.22.0");
  assert.match(blueprint, /NODE_VERSION[\s\S]*22\.22\.0/);
});
