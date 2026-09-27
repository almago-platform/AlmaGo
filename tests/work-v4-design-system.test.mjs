import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const homePage = readFileSync("src/app/page.tsx", "utf8");
const workCss = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("Brand V2 palette is the shared AlmaGo application baseline", () => {
  assert.match(globals, /--brand:\s*#db0423/i);
  assert.match(globals, /--background:\s*#f7f4ec/i);
  assert.match(globals, /--surface-muted:\s*#d9d3c7/i);
  assert.match(globals, /--accent:\s*#fcb50a/i);
  assert.match(globals, /--foreground:\s*#1c2124/i);
});

test("public homepage uses the scoped AlmaGo module and current Brand V2 tokens", () => {
  assert.match(homePage, /Homepage\.module\.css/);
  assert.doesNotMatch(homePage, /CodexHome\.module\.css/);
  assert.match(workCss, /--home-green:\s*#db0423/i);
  assert.match(workCss, /--home-terra:\s*#db0423/i);
  assert.match(workCss, /--home-gold:\s*#fcb50a/i);
  assert.match(workCss, /Source Serif 4/);
});

test("student and admin share the current Brand V2 shell tokens", () => {
  assert.match(shell, /bg-\[var\(--surface\)\]/);
  assert.match(shell, /bg-\[#fffdf8\]\/95/);
  assert.match(shell, /bg-\[var\(--brand-soft\)\]/);
  assert.match(shell, /text-\[var\(--foreground\)\]/);
});
