import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const quick = read("src/components/public/HomeQuickAccess.tsx");
const journey = read("src/components/public/HomeJourneySection.tsx");
const css = read("src/components/public/Homepage.module.css");

test("V4.1 consolidation is preserved as V4.2 expands the brand sections", () => {
  assert.doesNotMatch(page, /<HomePhotoBand/);
  assert.match(page, /photo=\{copy\.home\.photo\}/);
  assert.match(journey, /\{photo\.text\}/);
  const sections = ["<HomeAboutSection", "<HomeJourneySection", "<HomeServicesSection", "<HomeExperiencePreview", "<HomeFaqSection"];
  for (let i = 1; i < sections.length; i++) {
    assert.ok(page.indexOf(sections[i - 1]) < page.indexOf(sections[i]), sections[i] + " follows previous section");
  }
});

test("V4.1 retains focused three-link quick access", () => {
  assert.match(quick, /shortcuts\.map/);
  assert.equal((quick.match(/href: "#/g) || []).length, 3);
  for (const anchor of ["#parcours", "#programmes", "#faq"]) assert.ok(quick.includes(anchor));
});

test("The journey remains a neutral overview rather than fake progress", () => {
  assert.match(css, /Homepage V4\.1 Premium/);
  assert.match(css, /\.journeyRailStep:last-child > span\s*\{[\s\S]*?background: #1c2124/);
});
