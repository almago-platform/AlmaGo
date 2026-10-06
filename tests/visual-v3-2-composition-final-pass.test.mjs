import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const recommendation = readFileSync("src/components/prospect/ProspectProgrammeRecommendationCard.tsx", "utf8");
const catalogueCard = readFileSync("src/components/prospect/ProspectProgrammeCatalogueCard.tsx", "utf8");
const cover = readFileSync("src/components/prospect/ProspectUniversityCover.tsx", "utf8");
const offers = readFileSync("src/app/prospect/offers/page.tsx", "utf8");
const offerCopy = readFileSync("src/content/prospect-offers-copy.ts", "utf8");
const solutions = readFileSync("src/app/prospect/solutions/page.tsx", "utf8");
const roadmap = readFileSync("src/app/prospect/roadmap/page.tsx", "utf8");

test("final polish avoids repeating the same university photo across sibling cards", () => {
  assert.match(catalogue, /recommendationPhotoUniversities/);
  assert.match(catalogue, /resultPhotoUniversities/);
  assert.match(catalogue, /showUniversityPhoto/);
  assert.match(recommendation, /showUniversityPhoto = true/);
  assert.match(recommendation, /usePhoto=\{showUniversityPhoto\}/);
  assert.match(catalogueCard, /showUniversityPhoto = true/);
  assert.match(catalogueCard, /usePhoto=\{showUniversityPhoto\}/);
  assert.match(cover, /usePhoto \? media\?\.coverImageUrl/);
  assert.doesNotMatch(cover, /editorialIndex|padStart\(2/);
});

test("final polish keeps programme metadata readable and verification details collapsible", () => {
  assert.match(recommendation, /verificationRows/);
  assert.match(recommendation, /<details/);
  assert.match(recommendation, /\[overflow-wrap:normal\]/);
  assert.doesNotMatch(recommendation, /sm:grid-cols-3[\s\S]{0,900}programme\.field/);
});

test("locked offers uses the empty viewport for a clear three-step journey", () => {
  assert.match(offers, /copy\.lockedJourneySteps\.map/);
  assert.match(offers, /copy\.lockedJourneyNote/);
  assert.match(offers, /PremiumSectionHeader title=\{copy\.lockedJourneyTitle\}/);
  for (const key of ["lockedJourneyTitle", "lockedJourneySteps", "lockedJourneyNote"]) {
    assert.ok(offerCopy.includes(key), key);
  }
  assert.match(offerCopy, /lockedJourneySteps: \[string, string, string\]/);
});

test("solutions and roadmap use distinct compact composition modes", () => {
  assert.match(solutions, /variant="compact"/);
  assert.match(solutions, /#prospect-language-solutions/);
  assert.match(solutions, /#prospect-finance-solutions/);
  assert.match(solutions, /languageCourses\.length/);
  assert.match(solutions, /financeOptions\.length/);
  assert.match(roadmap, /variant="compact"/);
  assert.match(roadmap, /positionLabel/);
  assert.match(roadmap, /Étape \$\{current \+ 1\} sur \$\{journey\.length\}/);
  assert.match(roadmap, /currentStep\.title/);
});
