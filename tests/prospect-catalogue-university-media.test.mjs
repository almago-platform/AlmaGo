import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const card = readFileSync("src/components/prospect/ProspectProgrammeCatalogueCard.tsx", "utf8");
const recommendationCard = readFileSync("src/components/prospect/ProspectProgrammeRecommendationCard.tsx", "utf8");
const cover = readFileSync("src/components/prospect/ProspectUniversityCover.tsx", "utf8");
const media = readFileSync("src/lib/prospect/catalogue-media.ts", "utf8");
const copy = readFileSync("src/content/prospect-hub-copy.ts", "utf8");

test("prospect catalogue exposes an institution filter from catalogue data", () => {
  assert.match(page, /university\\?: string/);
  assert.match(page, /name="university"/);
  assert.match(page, /item\\.university\\.id, item\\.university\\.name/);
  assert.match(page, /normalized\\(programme\\.university\\.name\\) === normalized\\(university\\)/);
});

test("prospect catalogue supports deterministic sorting without client-side state", () => {
  assert.match(page, /name="sort"/);
  assert.match(page, /value="relevance"/);
  assert.match(page, /value="university"/);
  assert.match(page, /value="city"/);
  assert.match(page, /sort === "university"/);
  assert.match(page, /sort === "city"/);
});

test("prospect catalogue uses visual responsive programme cards", () => {
  assert.match(page, /ProspectProgrammeCatalogueCard/);
  assert.match(page, /grid gap-5 xl:grid-cols-2/);
  assert.match(card, /ProspectUniversityCover/);
  assert.match(card, /programme\\.university\\.name/);
  assert.match(card, /programme\\.degreeLevel/);
  assert.match(card, /programme\\.teachingLanguage/);
  assert.match(card, /programme\\.programmeSourceUrl/);
  assert.match(recommendationCard, /ProspectUniversityCover/);
});

test("university covers use stored media and retain a polished fallback", () => {
  assert.match(cover, /media\\?\\.coverImageUrl/);
  assert.match(cover, /universityInitials/);
  assert.match(cover, /coverImageSourceUrl/);
  assert.match(cover, /coverImageAttribution/);
  assert.match(cover, /coverImageLicense/);
  assert.doesNotMatch(cover, /<img/);
});

test("catalogue media enrichment is bounded, cached and contains no student identity", () => {
  assert.match(media, /MAX_MEDIA_LOOKUPS_PER_REQUEST = 10/);
  assert.match(media, /MEDIA_RETRY_DAYS = 30/);
  assert.match(media, /findWikimediaUniversityMedia/);
  assert.match(media, /media_verified_at/);
  assert.match(media, /\\.from\\("universities"\\)/);
  assert.match(media, /\\.update\\(update\\)/);
  assert.doesNotMatch(media, /userId|email|passport|phone|first_name|last_name|profile/);
});

test("catalogue filter and sorting copy is available in all four locales", () => {
  for (const expected of [
    'university: "Université"',
    'university: "University"',
    'university: "Hochschule"',
    'university: "الجامعة"',
    'sort: "Trier par"',
    'sort: "Sort by"',
    'sort: "Sortieren nach"',
    'sort: "الترتيب حسب"',
  ]) {
    assert.ok(copy.includes(expected), `missing copy: ${expected}`);
  }
});
