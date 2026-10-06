// CI retrigger: V3.1 density/composition validation
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const shell = readFileSync("src/components/layout/ProspectShell.tsx", "utf8");
const hero = readFileSync("src/components/prospect/ProspectPageHero.tsx", "utf8");
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const orientation = readFileSync("src/app/prospect/orientation/page.tsx", "utf8");
const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const roadmap = readFileSync("src/app/prospect/roadmap/page.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");

test("V3.1 compacts the Prospect shell without changing the white header pattern", () => {
  assert.match(shell, /min-h-\[64px\]/);
  assert.match(shell, /max-w-\[100rem\]/);
  assert.match(shell, /lg:grid-cols-\[13rem_minmax\(0,1fr\)\]/);
  assert.match(shell, /bg-\[rgba\(255,254,250,\.94\)\]/);
});

test("V3.1 uses a tighter hero scale", () => {
  assert.match(hero, /clamp\(1\.85rem,3\.35vw,3rem\)/);
  assert.match(hero, /sm:py-6/);
});

test("V3.1 reduces vertical whitespace on major Prospect pages", () => {
  assert.match(dashboard, /<main className="space-y-5">/);
  assert.match(orientation, /<main className="space-y-6">/);
  assert.match(catalogue, /<main className="space-y-6">/);
  assert.match(roadmap, /<main className="space-y-6">/);
});

test("V3.1 avoids stretched sparse grids on wide screens", () => {
  assert.match(orientation, /recommendations\.length/);
  assert.match(orientation, /sm:grid-cols-\[auto_minmax\(0,1fr\)_auto\]/);
  assert.doesNotMatch(orientation, /grid items-start gap-4 xl:grid-cols-3/);
  assert.match(catalogue, /prospect-programme-grid/);
  assert.match(catalogue, /wide=\{filtered\.length === 1\}/);
  assert.match(roadmap, /lg:grid-cols-\[minmax\(14rem,0\.65fr\)_minmax\(0,1\.35fr\)\]/);
});

test("V3.1 keeps the exact approved Campus Allemagne logo assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
