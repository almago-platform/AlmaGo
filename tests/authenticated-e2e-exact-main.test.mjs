import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(
  new URL("../.github/workflows/almago-authenticated-e2e.yml", import.meta.url),
  "utf8",
);

test("authenticated Render evidence is bound to the exact workflow SHA", () => {
  assert.match(workflow, /expected="\$\{GITHUB_SHA:0:12\}"/);
  assert.match(workflow, /revision=.*\.revision \/\/ empty/);
  assert.match(workflow, /branch=.*\.branch \/\/ empty/);
  assert.match(workflow, /Authenticated E2E requires exact Render revision/);
});

test("authenticated evidence rejects main or Render drift after browser journeys", () => {
  assert.match(
    workflow,
    /Revalidate exact main and Render after authenticated evidence/,
  );
  assert.match(workflow, /git ls-remote origin refs\/heads\/main/);
  assert.match(workflow, /current_main.*GITHUB_SHA/);
  assert.match(workflow, /main changed during authenticated E2E/);
  assert.match(workflow, /Render drifted during authenticated E2E/);
});
