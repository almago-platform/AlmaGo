import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const journey = read("src/components/public/HomeJourneySection.tsx");
const about = read("src/components/public/HomeAboutSection.tsx");
const preview = read("src/components/public/HomeExperiencePreview.tsx");
const copy = read("src/content/homepage-v42-copy.ts");
const css = read("src/components/public/Homepage.module.css");

test("V4.3 tells the service story before the preview and preserves six anchored steps", () => {
  const sequence = ["<HomeHero", "<HomeQuickAccess", "<HomeAboutSection", "<HomeServicesSection", "<HomeExperiencePreview", "<HomeJourneySection", "<HomeFaqSection", "<HomeFinalCta"];
  for (let i = 1; i < sequence.length; i++) {
    assert.ok(page.indexOf(sequence[i-1]) < page.indexOf(sequence[i]), sequence[i] + " follows " + sequence[i-1]);
  }
  assert.match(page, /phaseLabels=\{v42\.journeyPhases\}/);
  assert.match(journey, /const stepIds = \["projet", "documents", "programmes", "candidatures", "depart", "suivi"\] as const/);
  assert.match(journey, /journey\.steps\.slice\(groupIndex \* 2, groupIndex \* 2 \+ 2\)/);
  assert.match(journey, /id=\{stepIds\[index\]\}/);
  assert.doesNotMatch(journey, /<Image|images\.pexels\.com/);
});

test("free-account preview uses an intentionally balanced three-card desktop layout", () => {
  assert.match(preview, /data-tier=\{index === 0 \? "free" : "client"\}/);
  assert.match(css, /\.v42FeatureGrid\[data-tier="free"\] \{ grid-template-columns: repeat\(3, minmax\(0, 1fr\)\); \}/);
  assert.match(css, /@media \(max-width: 850px\)[\s\S]*\.v42FeatureGrid\[data-tier="free"\] \{ grid-template-columns: 1fr/);
});

test("verified contact path is present without invented registration or authority claims", () => {
  assert.match(about, /href="\/contact"/);
  assert.match(about, /mailto:contact@campus-allemagne\.info/);
  assert.match(about, /copy\.contactLabel/);
  assert.match(css, /\.v43AboutContact a:focus-visible/);
});

test("the three grouped phase headings and contact label are localized", () => {
  for (const lang of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp("^  " + lang + ": \\{", "m"));
  }
  assert.match(copy, /journeyPhases: readonly \[string, string, string\]/);
  assert.equal((copy.match(/journeyPhases: \[/g) || []).length, 4);
  assert.equal((copy.match(/contactLabel: "/g) || []).length, 4);
});
