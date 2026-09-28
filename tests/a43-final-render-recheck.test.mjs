import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-authenticated-e2e.yml",
  "utf8",
);

test("A43 completion receives the canonical Render base URL", () => {
  assert.match(workflow, /A43_BASE_URL: \$\{\{ env\.ALMAGO_BASE_URL \}\}/);
});

test("A43 fetches Render health again immediately before closure", () => {
  assert.match(workflow, /fetch\(baseUrl \+ "\/api\/health"/);
  assert.match(workflow, /final Render health check returned HTTP/);
  assert.match(workflow, /final Render health check failed/);
});

test("A43 final Render recheck requires exact revision and main branch", () => {
  assert.match(workflow, /const expectedRenderRevision = context\.sha\.slice\(0, 12\)/);
  assert.match(workflow, /finalHealth\?\.revision !== expectedRenderRevision/);
  assert.match(workflow, /finalHealth\?\.branch !== "main"/);
  assert.match(workflow, /Render drifted after authenticated E2E/);
});
