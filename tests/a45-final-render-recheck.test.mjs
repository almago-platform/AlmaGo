import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-final-release-gate.yml",
  "utf8",
);

test("A45 fetches Render health again immediately before READY", () => {
  assert.match(workflow, /fetch\(renderBaseUrl \+ "\/api\/health"/);
  assert.match(workflow, /final Render health check returned HTTP/);
  assert.match(workflow, /final Render health check failed/);
});

test("A45 final Render recheck requires exact release revision and main branch", () => {
  assert.match(workflow, /const finalExpectedRevision = sha\.slice\(0, 12\)/);
  assert.match(workflow, /finalRenderHealth\?\.revision !== finalExpectedRevision/);
  assert.match(workflow, /finalRenderHealth\?\.branch !== "main"/);
  assert.match(workflow, /Render drifted before publication/);
});
