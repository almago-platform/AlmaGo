import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const health = readFileSync("src/app/api/health/route.ts", "utf8");
const nextConfig = readFileSync("next.config.ts", "utf8");

test("health endpoint remains no-store and reports the build revision safely", () => {
  assert.match(health, /status: "ok"/);
  assert.match(health, /service: "almago"/);
  assert.match(health, /ALMAGO_BUILD_COMMIT\?\.slice\(0, 12\)/);
  assert.match(health, /ALMAGO_BUILD_BRANCH/);
  assert.match(health, /"Cache-Control": "no-store"/);
  assert.match(nextConfig, /gitBuildValue\("rev-parse", "--verify", "HEAD"\)/);
  assert.match(nextConfig, /ALMAGO_BUILD_COMMIT:/);
  assert.match(nextConfig, /ALMAGO_BUILD_BRANCH:/);
});
