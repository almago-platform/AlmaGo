import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const health = readFileSync("src/app/api/health/route.ts", "utf8");

test("health endpoint remains no-store and reports the Render revision safely", () => {
  assert.match(health, /status: "ok"/);
  assert.match(health, /service: "almago"/);
  assert.match(health, /RENDER_GIT_COMMIT\?\.slice\(0, 12\)/);
  assert.match(health, /RENDER_GIT_BRANCH/);
  assert.match(health, /"Cache-Control": "no-store"/);
});
