import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/ProspectShell.tsx", "utf8");
const designSystem = readFileSync("src/app/design-system.css", "utf8");

test("prospect desktop sidebar is a full-height structural rail, not a floating card", () => {
  assert.match(shell, /prospect-desktop-rail/);
  assert.match(shell, /min-h-\[calc\(100vh-67px\)\]/);
  assert.match(shell, /self-stretch/);
  assert.match(shell, /lg:gap-0/);
  assert.match(shell, /lg:px-0 lg:py-0/);
  assert.doesNotMatch(shell, /hidden h-fit overflow-hidden rounded-\[1\.35rem\]/);
});

test("prospect rail keeps navigation sticky inside the full-height background", () => {
  assert.match(shell, /lg:sticky lg:top-\[67px\]/);
  assert.match(shell, /lg:max-h-\[calc\(100vh-67px\)\]/);
  assert.match(shell, /lg:overflow-y-auto/);
});

test("prospect rail extends to the logical viewport edge in LTR and RTL", () => {
  assert.match(designSystem, /\.prospect-desktop-rail::before/);
  assert.match(designSystem, /inset-inline-end: 100%/);
  assert.match(designSystem, /calc\(\(100vw - 100rem\) \/ 2\)/);
  assert.match(designSystem, /background: #17191b/);
});

test("main content retains desktop breathing room after removing the floating sidebar gap", () => {
  assert.match(shell, /scroll-mt-24 lg:px-5 lg:py-6 xl:px-6/);
});
