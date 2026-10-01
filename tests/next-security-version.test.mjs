import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));

test("Partner-Ready pins the patched Next.js 16.3 line", () => {
  assert.equal(pkg.dependencies.next, "16.3.8");
  assert.equal(pkg.devDependencies["eslint-config-next"], "16.3.8");
  assert.equal(lock.packages[""].dependencies.next, "16.3.8");
  assert.equal(lock.packages[""].devDependencies["eslint-config-next"], "16.3.8");
  assert.equal(lock.packages["node_modules/next"].version, "16.3.8");
  assert.equal(lock.packages["node_modules/@next/env"].version, "16.3.8");
  assert.equal(lock.packages["node_modules/eslint-config-next"].version, "16.3.8");
  assert.equal(lock.packages["node_modules/@next/eslint-plugin-next"].version, "16.3.8");
});

test("all platform-specific Next SWC packages match the patched runtime", () => {
  const swc = Object.entries(lock.packages)
    .filter(([path]) => path.startsWith("node_modules/@next/swc-"));
  assert.ok(swc.length >= 8);
  for (const [path, metadata] of swc) {
    assert.equal(metadata.version, "16.3.8", path);
  }
});

test("the lockfile contains no stale Next 16.3.5 metadata", () => {
  assert.equal(readFileSync("package-lock.json", "utf8").includes("16.3.5"), false);
});
