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
  assert.ok(page.includes("university?: string"));
  assert.ok(page.includes('name="university"'));
  assert.ok(page.includes("item.university.id, item.university.name"));
  assert.ok(page.includes("normalized(programme.university.name) === normalized(university)"));
});

test("prospect catalogue supports deterministic sorting without client-side state", () => {
  assert.ok(page.includes('name="sort"'));
  assert.ok(page.includes('value="relevance"'));
  assert.ok(page.includes('value="university"'));
  assert.ok(page.includes('value="city"'));
  assert.ok(page.includes('sort === "university"'));
  assert.ok(page.includes('sort === "city"'));
});

test("prospect catalogue uses visual responsive programme cards", () => {
  assert.ok(page.includes("ProspectProgrammeCatalogueCard"));
  assert.ok(page.includes("grid gap-5 xl:grid-cols-2"));
  assert.ok(card.includes("ProspectUniversityCover"));
  assert.ok(card.includes("programme.university.name"));
  assert.ok(card.includes("programme.degreeLevel"));
  assert.ok(card.includes("programme.teachingLanguage"));
  assert.ok(card.includes("programme.programmeSourceUrl"));
  assert.ok(recommendationCard.includes("ProspectUniversityCover"));
});

test("university covers use stored media and retain a polished fallback", () => {
  assert.ok(cover.includes("media?.coverImageUrl"));
  assert.ok(cover.includes("universityInitials"));
  assert.ok(cover.includes("coverImageSourceUrl"));
  assert.ok(cover.includes("coverImageAttribution"));
  assert.ok(cover.includes("coverImageLicense"));
  assert.doesNotMatch(cover, /<img/);
});

test("catalogue media enrichment works without the privileged DB key and persists when available", () => {
  assert.ok(media.includes("MAX_MEDIA_LOOKUPS_PER_REQUEST = 40"));
  assert.ok(media.includes("MEDIA_RETRY_DAYS = 30"));
  assert.ok(media.includes("canPersistMedia"));
  assert.ok(media.includes("findWikimediaUniversityMedia"));
  assert.ok(media.includes("media_verified_at"));
  assert.ok(media.includes('row ? shouldRetryMedia(row) : true'));
  assert.ok(media.includes('.from("universities")'));
  assert.ok(media.includes(".update(update)"));
  assert.doesNotMatch(
    media,
    /!process\.env\.SUPABASE_SECRET_KEY[\s\S]{0,80}return catalogue/,
  );
  assert.doesNotMatch(media, /userId|email|passport|phone|first_name|last_name|profile/);
});

test("Wikimedia lookups are cached and use a bounded fallback search", () => {
  const wikimedia = readFileSync(
    "src/lib/orientation-engine/discovery/university-media.ts",
    "utf8",
  );
  assert.ok(wikimedia.includes("MEDIA_CACHE_SECONDS"));
  assert.ok(wikimedia.includes("revalidate: MEDIA_CACHE_SECONDS"));
  assert.ok(wikimedia.includes("MEDIA_TIMEOUT_MS = 3_000"));
  assert.ok(wikimedia.includes('[universityName, city]'));
  assert.ok(wikimedia.includes('[universityName, city, "campus"]'));
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
