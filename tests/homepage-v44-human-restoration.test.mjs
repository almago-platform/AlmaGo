import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(file, "utf8");
const page = read("src/app/page.tsx");
const journey = read("src/components/public/HomeJourneySection.tsx");
const css = read("src/components/public/Homepage.module.css");

const originalPhotoIds = [
  "7973208", "6207367", "31039023", "5306450", "5940705", "7972361",
];

test("restore the original V4.2 six photographs, in the exact historical order", () => {
  const imageIds = [...journey.matchAll(/images\.pexels\.com\/photos\/(\d+)\/pexels-photo-/g)].map((match) => match[1]);
  assert.deepEqual(imageIds, originalPhotoIds);
  assert.match(journey, /images\[index\]/);
  assert.match(journey, /alt=\{journey\.imageAlts\[index\]\}/);
  assert.match(journey, /sizes="\(min-width: 1200px\) 31vw, \(min-width: 700px\) 48vw, 100vw"/);
});

test("retain the lively two-row, three-column journey including its timeline", () => {
  assert.match(journey, /className=\{s\.journeyRail\}/);
  assert.match(journey, /className=\{s\.steps\}/);
  assert.match(journey, /className=\{s\.stepMedia\}/);
  assert.match(journey, /className=\{s\.stepBody\}/);
  assert.match(css, /\.steps\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.journeyRailStep:last-child > span/);
  assert.equal((journey.match(/journey\.steps\.map/g) || []).length, 2);
});

test("give photographic journey priority and preserve meaningful marketing information", () => {
  const ordered = ["<HomeHero", "<HomeQuickAccess", "<HomeAboutSection", "<HomeJourneySection",
    "<HomeServicesSection", "<HomeExperiencePreview", "<HomeFaqSection", "<HomeFinalCta"];
  for (let i = 1; i < ordered.length; i++) {
    assert.ok(page.indexOf(ordered[i-1]) < page.indexOf(ordered[i]),
      ordered[i] + " must come after " + ordered[i-1]);
  }
  assert.doesNotMatch(page, /phaseLabels=\{v42\.journeyPhases\}/);
  for (const anchor of ["projet", "documents", "programmes", "candidatures", "depart", "suivi"]) {
    assert.match(journey, new RegExp('"' + anchor + '"'));
  }
});
