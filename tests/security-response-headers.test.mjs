import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const config = readFileSync("next.config.ts", "utf8");

test("Next applies baseline defensive response headers globally", () => {
  assert.match(config, /X-Content-Type-Options/);
  assert.match(config, /nosniff/);
  assert.match(config, /X-Frame-Options/);
  assert.match(config, /DENY/);
  assert.match(config, /Referrer-Policy/);
  assert.match(config, /strict-origin-when-cross-origin/);
  assert.match(config, /Permissions-Policy/);
  assert.match(config, /camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\)/);
  assert.match(config, /source:\s*"\/:path\*"/);
});

test("security header task deliberately does not introduce a speculative CSP", () => {
  assert.doesNotMatch(config, /Content-Security-Policy/);
});
