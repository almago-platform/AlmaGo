import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(
  ".github/workflows/almago-authenticated-e2e.yml",
  "utf8",
);

test("A43 Render mode requires the exact workflow revision", () => {
  assert.match(workflow, /expected_revision="\$\{GITHUB_SHA:0:12\}"/);
  assert.match(workflow, /jq -r '\.revision \/\/ empty'/);
  assert.match(workflow, /jq -r '\.branch \/\/ empty'/);
  assert.match(
    workflow,
    /\[ "\$revision" = "\$expected_revision" \] && \[ "\$branch" = "main" \]/,
  );
  assert.match(workflow, /Render did not serve exact workflow revision/);
});

test("A43 revalidates exact current main before closing", () => {
  assert.match(workflow, /const expectedRef = `refs\/heads\/\$\{mainBranch\}`/);
  assert.match(workflow, /if \(context\.ref !== expectedRef\)/);
  assert.match(workflow, /currentMain\.commit\.sha !== context\.sha/);
  assert.match(workflow, /main changed during authenticated E2E/);
});

test("A43 evidence is labeled as exact-main evidence", () => {
  assert.match(workflow, /"Exact main SHA: " \+ context\.sha/);
  assert.match(
    workflow,
    /almago-a43-evidence:run=\$\{context\.runId\};sha=\$\{context\.sha\}/,
  );
});
