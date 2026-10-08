import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const quick = read("src/components/public/HomeQuickAccess.tsx");
const journey = read("src/components/public/HomeJourneySection.tsx");
const css = read("src/components/public/Homepage.module.css");

test("V4.1 combines photo editorial guidance and six steps in one section", () => {
  assert.doesNotMatch(page, /<HomePhotoBand/);
  assert.match(page, /photo=\{copy\.home\.photo\}/);
  assert.match(journey, /\{photo\.text\}/);
  assert.match(page, /<HomeProductPreview \/>[\s\S]*<HomeJourneySection/);
});

test("V4.1 offers exactly three useful quick links", () => {
  assert.match(quick, /shortcuts\.map/);
  assert.equal((quick.match(/href: "#/g) || []).length, 3);
  for (const anchor of ["#parcours", "#programmes", "#faq"]) assert.ok(quick.includes(anchor));
});

test("V4.1 journey no longer marks step six as a current progress state", () => {
  assert.match(css, /Homepage V4\.1 Premium/);
  assert.match(css, /\.journeyRailStep:last-child > span\s*\{[\s\S]*?background: #1c2124/);
  assert.match(css, /\.journey \.stepCard:last-child \.stepIndex\s*\{[\s\S]*?background: rgba\(28, 33, 36, 0\.84\)/);
});
