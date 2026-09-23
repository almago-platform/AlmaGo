import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { selectScreenshots } from "./visual-review.mjs";

test("visual review prefers home screenshots and enforces the image cap", () => {
  const dir = mkdtempSync(join(tmpdir(), "almago-visual-"));
  mkdirSync(dir, { recursive: true });
  for (const name of ["login-mobile.png", "home-mobile.png", "home-desktop.png", "signup.png"]) {
    writeFileSync(join(dir, name), "x");
  }
  assert.deepEqual(selectScreenshots(dir, 2), ["home-desktop.png", "home-mobile.png"]);
});

test("visual review returns an empty set when screenshot directory is missing", () => {
  assert.deepEqual(selectScreenshots("/definitely/missing/almago/screenshots", 2), []);
});
