import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-authenticated-e2e.yml", "utf8");

test("A43 owner-comment probe is narrowly scoped", () => {
  assert.match(workflow, /issue_comment:\s*\n\s*types: \[created\]/);
  assert.match(workflow, /github\.event\.issue\.number == 84/);
  assert.match(workflow, /github\.event\.comment\.user\.login == 'tayariAyoub'/);
  assert.match(workflow, /github\.event\.comment\.body == 'A43 AUTHENTICATED E2E PROBE'/);
});

test("A43 probe keeps existing safe workflow dispatch and main push paths", () => {
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /needs\.configuration\.outputs\.ready == 'true'/);
});


test("A43 comment probes cannot cancel an active evidence run", () => {
  assert.match(
    workflow,
    /concurrency:\s*\n\s*group: almago-authenticated-e2e\s*\n\s*cancel-in-progress: \$\{\{ github\.event_name != 'issue_comment' \}\}/,
  );
});
