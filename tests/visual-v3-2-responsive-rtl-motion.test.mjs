import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const playwright = read("playwright.config.mjs");
const designSystem = read("src/app/design-system.css");
const globals = read("src/app/globals.css");
const prospect = read("src/app/prospect-v3.css");
const student = read("src/app/student-v3.css");
const admin = read("src/app/admin-v3.css");
const shell = read("src/components/layout/AppShell.tsx");

test("V3.2 responsive browser matrix covers compact phones through wide desktop", () => {
  for (const width of [320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
    assert.match(playwright, new RegExp(`width: ${width}\\b`), `missing width ${width}`);
  }
  assert.match(playwright, /mobile-compact-chromium/);
  assert.match(playwright, /desktop-1280-chromium/);
  assert.match(playwright, /wide-chromium/);
});

test("premium surfaces fail safe inside narrow grids and long-content layouts", () => {
  for (const selector of [".pc-card", ".pc-panel", ".pc-hero", ".pc-empty-state", ".pc-soft-strip", ".pc-waiting-strip"]) {
    const escaped = selector.replace(".", "\\.");
    assert.match(designSystem, new RegExp(`${escaped}[\\s\\S]*min-width: 0`), selector);
    assert.match(designSystem, new RegExp(`${escaped}[\\s\\S]*max-width: 100%`), selector);
  }
  assert.match(designSystem, /overflow-wrap: anywhere/);
  assert.match(designSystem, /@media \(max-width: 359px\)[\s\S]*\.pc-button[\s\S]*white-space: normal/);
  assert.match(designSystem, /\.pc-button[\s\S]*max-inline-size: 100%/);
});

test("premium accents mirror logically in RTL without changing stored content", () => {
  assert.match(designSystem, /html\[dir="rtl"\] \.pc-kicker/);
  assert.match(designSystem, /html\[dir="rtl"\] \.pc-hero::before/);
  assert.match(designSystem, /html\[dir="rtl"\] \.pc-empty-state-visual::before/);
  assert.match(designSystem, /transform: scaleX\(-1\)/);
  assert.match(student, /html\[dir="rtl"\] \.student-shell \.student-shell-sidebar/);
  assert.match(student, /padding-right: 15\.5rem/);
  assert.match(globals, /html\[dir="rtl"\] \.student-guidance-panel/);
  assert.match(globals, /unicode-bidi: isolate/);
});

test("AppShell applies RTL only to localized student surfaces and keeps Admin intentionally LTR", () => {
  assert.match(shell, /dir=\{role === "admin" \? "ltr" : direction\}/);
  assert.match(shell, /role === "student" \? "lg:start-0 lg:border-e" : "lg:left-0 lg:border-r"/);
  assert.match(shell, /role === "student" \? "lg:ps-\[15\.5rem\]" : "lg:pl-\[15\.5rem\]"/);
});

test("reduced-motion is enforced globally and within product shells", () => {
  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0\.01ms !important/);
  assert.match(globals, /@media \(prefers-reduced-motion: reduce\)[\s\S]*animation-duration: 0\.01ms !important/);
  assert.match(designSystem, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.pc-card-interactive/);
  assert.match(designSystem, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.pc-button/);
  assert.match(prospect, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(student, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(admin, /@media \(prefers-reduced-motion: reduce\)/);
});

test("product shells clip accidental horizontal overflow at the shell boundary", () => {
  assert.match(prospect, /\.prospect-shell \{[\s\S]*overflow-x: clip/);
  assert.match(student, /\.student-shell \{[\s\S]*overflow-x: clip/);
  assert.match(admin, /\.admin-shell \{[\s\S]*overflow-x: clip/);
});
