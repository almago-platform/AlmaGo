import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const prospect = readFileSync("src/components/layout/ProspectShell.tsx", "utf8");
const studentCss = readFileSync("src/app/student-v3.css", "utf8");
const adminCss = readFileSync("src/app/admin-v3.css", "utf8");
const prospectCss = readFileSync("src/app/prospect-v3.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");

test("Visual V3 desktop Student shell uses logical RTL positioning", () => {
  assert.match(shell, /role === "student" \? "lg:start-0 lg:border-e" : "lg:left-0 lg:border-r"/);
  assert.match(shell, /role === "student" \? "lg:ps-\[15\.5rem\]" : "lg:pl-\[15\.5rem\]"/);
  assert.match(shell, /student-shell-active-edge absolute inset-y-2 start-0/);
});

test("Visual V3 mirrors Student elevation and hover motion in Arabic RTL", () => {
  assert.match(studentCss, /html\[dir="rtl"\] \.student-shell \.student-shell-sidebar[\s\S]*box-shadow:\s*-20px 0 70px/);
  assert.match(studentCss, /html\[dir="rtl"\] \.student-shell \.student-shell-sidebar nav a:hover[\s\S]*translateX\(-1px\)/);
  assert.match(studentCss, /\.student-shell \{[\s\S]*overflow-x:\s*clip/);
});

test("Visual V3 Prospect mobile drawer is localized, modal and narrow-screen safe", () => {
  assert.match(prospect, /aria-controls="prospect-mobile-menu"/);
  assert.match(prospect, /id="prospect-mobile-menu" role="dialog" aria-modal="true"/);
  assert.match(prospect, /aria-label=\{copy\.shell\.closeMenu\}/);
  assert.match(prospect, /max-w-\[8rem\]/);
  assert.match(prospect, /hidden sm:block"><LanguageSwitcher compact/);
  assert.match(prospect, /safe-area-inset-top/);
  assert.match(prospect, /safe-area-inset-bottom/);
});

test("Visual V3 authenticated surfaces prevent accidental viewport overflow", () => {
  assert.match(adminCss, /\.admin-shell \{[\s\S]*overflow-x:\s*clip/);
  assert.match(prospectCss, /\.prospect-shell \{[\s\S]*overflow-x:\s*clip/);
});

test("Visual V3 Prospect respects reduced motion and visible keyboard focus", () => {
  assert.match(prospectCss, /prefers-reduced-motion:\s*reduce/);
  assert.match(prospectCss, /transition-duration:\s*0\.01ms/);
  assert.match(prospectCss, /focus-visible/);
  assert.match(layout, /import "\.\/prospect-v3\.css"/);
});

test("final polish keeps the exact approved Campus Allemagne logo assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
