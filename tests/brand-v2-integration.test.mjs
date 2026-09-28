import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const manifest = readFileSync("src/app/manifest.ts", "utf8");
const master = readFileSync("public/brand/almago-logo.svg", "utf8");
const reverse = readFileSync("public/brand/almago-logo-reverse.svg", "utf8");
const symbol = readFileSync("public/brand/almago-symbol.svg", "utf8");

test("Brand V2 official palette is the shared application palette", () => {
  assert.match(globals, /--foreground:\s*#1c2124/i);
  assert.match(globals, /--brand:\s*#db0423/i);
  assert.match(globals, /--accent:\s*#fcb50a/i);
  assert.match(globals, /--background:\s*#f7f4ec/i);
  assert.match(globals, /--surface-muted:\s*#d9d3c7/i);
  assert.match(globals, /--muted:\s*#6b6f72/i);
});

test("Brand V2 typography loads Latin brand fonts and native Arabic typography", () => {
  assert.match(layout, /Inter, Noto_Sans_Arabic, Source_Serif_4/);
  assert.match(globals, /--font-inter/);
  assert.match(globals, /--font-source-serif/);
  assert.match(layout, /--font-arabic/);
});

test("official vector logo is used on public and authenticated shells", () => {
  assert.match(header, /BrandLogo/);
  assert.match(footer, /variant="reverse"/);
  assert.match(shell, /BrandLogo/);
  assert.doesNotMatch(header, /logoMark}>A/);
  assert.doesNotMatch(shell, />\s*A\s*</);
});

test("master, reverse and symbol remain vector assets", () => {
  assert.match(master, /viewBox="0 0 1410 514"/);
  assert.match(master, /fill="#1C2124"/);
  assert.match(master, /fill="#DB0423"/);
  assert.match(master, /fill="#FCB50A"/);
  assert.doesNotMatch(master, /<image\b/i);
  assert.match(reverse, /fill="#FFFFFF"/);
  assert.match(symbol, /viewBox="0 0 540 514"/);
});

test("favicon and PWA manifest reference the V2 symbol", () => {
  const icon = readFileSync("src/app/icon.svg", "utf8");
  assert.match(icon, /viewBox="0 0 540 514"/);
  assert.match(manifest, /almago-symbol\.svg/);
  assert.match(manifest, /theme_color:\s*"#DB0423"/);
  assert.match(manifest, /background_color:\s*"#F7F4EC"/);
});
