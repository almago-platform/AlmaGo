import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const homePage = readFileSync("src/app/page.tsx", "utf8");
const workCss = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("Work V4 palette is the shared AlmaGo design baseline", () => {
  assert.match(globals, /--brand:\s*#214e43/i);
  assert.match(globals, /--background:\s*#f7f6f0/i);
  assert.match(globals, /--surface-muted:\s*#e9eee5/i);
  assert.match(globals, /--accent:\s*#984c31/i);
  assert.match(globals, /--foreground:\s*#173f36/i);
});

test("public homepage uses Work V4 and not the former Codex module", () => {
  assert.match(homePage, /Homepage\.module\.css/);
  assert.doesNotMatch(homePage, /CodexHome\.module\.css/);
  assert.match(workCss, /--home-green:\s*#214e43/i);
  assert.match(workCss, /--home-terra:\s*#984c31/i);
  assert.match(workCss, /Georgia, "Times New Roman", serif/);
});

test("student and admin share the Work V4 application shell tokens", () => {
  assert.match(shell, /bg-\[var\(--surface\)\]/);
  assert.match(shell, /bg-\[#fffefa\]\/95/);
  assert.match(shell, /bg-\[var\(--brand-soft\)\]/);
  assert.match(shell, /text-\[var\(--foreground\)\]/);
});
