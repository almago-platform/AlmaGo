import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/almago-browser-quality.yml", "utf8");
const publicQuality = readFileSync("tests/e2e/public-quality.spec.mjs", "utf8");

test("browser quality explicitly enables the Phase 2 public orientation", () => {
  assert.match(workflow, /ALMAGO_PHASE2_ENABLED: "true"/);
  assert.match(publicQuality, /const phase2Enabled = process\.env\.ALMAGO_PHASE2_ENABLED === "true"/);
  assert.match(publicQuality, /path: "\/orientation", name: "orientation"/);
});

test("Arabic orientation joins the RTL overflow and accessibility smoke", () => {
  assert.match(publicQuality, /page\.goto\("\/orientation"/);
  assert.match(publicQuality, /من أين تبدأ مشروع الدراسة في ألمانيا؟/);
  assert.match(publicQuality, /Arabic orientation must not overflow horizontally/);
  assert.match(publicQuality, /orientationAxe/);
  assert.match(publicQuality, /orientation-ar-/);
});
