import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const staticSections = [
  "HomeHero.tsx",
  "HomeQuickAccess.tsx",
  "HomePhotoBand.tsx",
  "HomeJourneySection.tsx",
  "HomeTrustSection.tsx",
  "HomeFaqSection.tsx",
  "HomeClosing.tsx",
].map((name) => readFileSync(`src/components/public/${name}`, "utf8"));

test("homepage keeps interaction client-side only where it is needed", () => {
  assert.doesNotMatch(page, /"use client"/);
  assert.match(header, /"use client"/);
  for (const source of staticSections) assert.doesNotMatch(source, /"use client"/);
});

test("homepage critical media keeps explicit loading hints without bypassing Next optimization", () => {
  assert.match(hero, /priority/);
  assert.match(hero, /fetchPriority="high"/);
  assert.doesNotMatch(logo, /unoptimized/);
  assert.match(logo, /sizes=/);
});

test("Arabic fonts remain available but are not preloaded on every Latin homepage request", () => {
  assert.match(layout, /Noto_Sans_Arabic/);
  assert.match(layout, /Noto_Kufi_Arabic/);
  assert.equal((layout.match(/preload: false/g) || []).length, 2);
});
