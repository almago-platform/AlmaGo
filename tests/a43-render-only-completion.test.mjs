import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-authenticated-e2e.yml",
  "utf8",
);

test("A43 completion is restricted to the Render target", () => {
  assert.match(
    workflow,
    /env\.ALMAGO_E2E_TARGET == 'render'/,
  );
});

test("local authenticated E2E remains available without completing A43", () => {
  assert.match(workflow, /options:\s*\n\s*- render\s*\n\s*- local/);
  assert.match(workflow, /if: env\.ALMAGO_E2E_TARGET != 'render'/);
  assert.match(workflow, /if: env\.ALMAGO_E2E_TARGET == 'render'/);
});

test("Render completion still depends on exact-main evidence", () => {
  assert.match(workflow, /revision" = "\$expected_revision"/);
  assert.match(workflow, /branch" = "main"/);
  assert.match(workflow, /currentMain\.commit\.sha !== context\.sha/);
});
