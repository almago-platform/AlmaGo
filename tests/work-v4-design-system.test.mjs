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
  assert.doesNotMatch(workCss, /Source Serif 4/);
  assert.doesNotMatch(workCss, /font-style:\s*italic/);
  assert.match(workCss, /\.sectionTitle em,[\s\S]*?font-family:\s*inherit;[\s\S]*?font-style:\s*normal;[\s\S]*?font-weight:\s*inherit;/);
  assert.match(workCss, /\.photoBandTitle em\s*\{[\s\S]*?font-weight:\s*inherit;/);
  assert.match(workCss, /\.finalCta h2 em\s*\{[\s\S]*?font-weight:\s*inherit;/);
});

test("student and admin share the current Brand V2 shell tokens", () => {
  assert.match(shell, /bg-\[var\(--surface\)\]/);
  assert.match(shell, /bg-\[var\(--surface\)\]\/95/);
  assert.match(shell, /bg-\[var\(--brand-soft\)\]/);
  assert.match(shell, /text-\[var\(--foreground\)\]/);
});


test("Latin public and authenticated headings use one upright sans-serif system", () => {
  assert.match(globals, /\.editorial-accent\s*\{[\s\S]*var\(--font-inter\)[\s\S]*font-style:\s*normal/);
  assert.match(globals, /\.page-title\s*\{[\s\S]*var\(--font-inter\)[\s\S]*font-style:\s*normal/);
  assert.doesNotMatch(globals, /Source Serif 4/);
  assert.doesNotMatch(globals, /font-source-serif/);
});
