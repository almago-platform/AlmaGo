import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const form = readFileSync("src/components/auth/AuthForm.tsx", "utf8");
const helper = readFileSync("tests/e2e/auth-test-helpers.mjs", "utf8");

test("auth submit is disabled until the client hydration boundary is ready", () => {
  assert.match(form, /useSyncExternalStore/);
  assert.match(form, /data-auth-ready=\{hydrated \? "true" : "false"\}/);
  assert.match(form, /disabled=\{loading \|\| !hydrated \|\| restrictedAction\}/);
});

test("A43 waits for the hydrated auth form before submitting credentials", () => {
  assert.match(helper, /form\[data-auth-ready="true"\]/);
  assert.match(helper, /timeout: 20_000/);
});
