import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-final-release-gate.yml", "utf8");
const checklist = readFileSync("docs/release-checklist.md", "utf8");

test("A45 no longer depends on Vercel readiness", () => {
  assert.doesNotMatch(workflow, /vercel-and-ready/);
  assert.doesNotMatch(workflow, /status\.context === "Vercel"/);
  assert.doesNotMatch(checklist, /successful Vercel status/);
});

test("A45 requires the exact main revision from the Render health endpoint", () => {
  assert.match(workflow, /RENDER_BASE_URL: https:\/\/almago-dev\.onrender\.com/);
  assert.match(workflow, /EXPECTED_MAIN_SHA: \$\{\{ needs\.prerequisites\.outputs\.main_sha \}\}/);
  assert.match(workflow, /expected_short="\$\{EXPECTED_MAIN_SHA:0:12\}"/);
  assert.match(workflow, /\/api\/health/);
  assert.match(workflow, /revision.*expected_short/);
  assert.match(workflow, /branch.*"main"/);
});

test("A45 tolerates cold start but fails boundedly on a stale Render deployment", () => {
  assert.match(workflow, /for i in \{1\.\.30\}/);
  assert.match(workflow, /--max-time 5/);
  assert.match(workflow, /Render did not serve exact main revision/);
  assert.match(workflow, /timeout-minutes: 10/);
});

test("A45 smokes canonical public routes and never performs a deployment", () => {
  assert.match(workflow, /for path in \/ \/login \/signup/);
  assert.match(workflow, /No deployment or merge was performed by this gate/);
  assert.doesNotMatch(workflow, /trigger_deploy|deployHook|render\.com\/deploy/);
});

test("release checklist documents exact Render evidence", () => {
  assert.match(checklist, /Canonical runtime evidence/);
  assert.match(checklist, /first 12 characters of the exact \x60main\x60 SHA/);
  assert.match(checklist, /branch.*\x60main\x60/);
  assert.match(checklist, /bounded Render Free cold start/);
});
