import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const layout = readFileSync("src/app/layout.tsx", "utf8");
const provider = readFileSync("src/components/i18n/LocaleProvider.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");

test("homepage keeps the approved logo source while using responsive Next image optimization", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.doesNotMatch(logo, /unoptimized/);
  assert.match(logo, /sizes=/);
});

test("Arabic fonts remain available without preloading both families on every Latin request", () => {
  assert.match(layout, /Noto_Sans_Arabic/);
  assert.match(layout, /Noto_Kufi_Arabic/);
  assert.equal((layout.match(/preload: false/g) || []).length, 2);
});

test("locale copy is prepared server-side instead of bundling native-copy at runtime in the provider", () => {
  assert.match(layout, /rebrandCopy\(getNativeCopy\(locale\)\)/);
  assert.match(provider, /initialCopy/);
  assert.match(provider, /import type \{ getNativeCopy \}/);
  assert.doesNotMatch(provider, /import \{ getNativeCopy \}/);
  assert.doesNotMatch(provider, /rebrandCopy/);
});

test("hero LCP request remains eager and explicitly high priority", () => {
  assert.match(hero, /priority/);
  assert.match(hero, /fetchPriority="high"/);
  assert.match(hero, /quality=\{90\}/);
  assert.match(hero, /w=1920/);
});
