import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  buildOrientationResearchUniversityDedupeKey,
} = await import("../src/lib/orientation-engine/discovery/knowledge-core.ts");

const migration = readFileSync(
  "supabase/migrations/20261004123000_orientation_university_registry_media.sql",
  "utf8",
);
const knowledge = readFileSync(
  "src/lib/orientation-engine/discovery/knowledge.ts",
  "utf8",
);
const media = readFileSync(
  "src/lib/orientation-engine/discovery/university-media.ts",
  "utf8",
);
const resultTypes = readFileSync(
  "src/lib/orientation-engine/result/types.ts",
  "utf8",
);
const resultService = readFileSync(
  "src/lib/orientation-engine/result/service.ts",
  "utf8",
);
const catalog = readFileSync(
  "src/lib/orientation-engine/catalog.ts",
  "utf8",
);
const card = readFileSync(
  "src/components/orientation/OrientationPersonalizedWriterCard.tsx",
  "utf8",
);

function university(overrides = {}) {
  return {
    institution: "RWTH Aachen University",
    city: "Aachen",
    officialUniversityUrl: "https://www.rwth-aachen.de/",
    ...overrides,
  };
}

test("university identity collapses programme URLs and name aliases sharing the official host", () => {
  const first = buildOrientationResearchUniversityDedupeKey(
    university({
      institution: "RWTH Aachen University",
      officialUniversityUrl: "https://www.rwth-aachen.de/go/id/abc",
    }),
  );
  const second = buildOrientationResearchUniversityDedupeKey(
    university({
      institution: "Rheinisch-Westfälische Technische Hochschule Aachen",
      officialUniversityUrl: "https://rwth-aachen.de/studium/foo",
    }),
  );

  assert.equal(first, "host:rwth-aachen.de");
  assert.equal(first, second);
});

test("university identity has a stable name and city fallback without an official URL", () => {
  assert.equal(
    buildOrientationResearchUniversityDedupeKey(
      university({
        institution: "  Example   University ",
        city: " Aachen ",
        officialUniversityUrl: null,
      }),
    ),
    "name:example university|city:aachen",
  );
});

test("migration normalizes research programmes under one canonical university registry", () => {
  assert.match(migration, /add column if not exists canonical_key text/);
  assert.match(migration, /add column if not exists aliases text\[\]/);
  assert.match(migration, /universities_canonical_key_unique unique \(canonical_key\)/);
  assert.match(migration, /orientation_research_programs[\s\S]*university_id uuid/);
  assert.match(migration, /references public\.universities\(id\) on delete set null/);
  assert.match(migration, /registry_status[\s\S]*research_candidate/);
  assert.match(migration, /'research_candidate',[\s\S]*false,[\s\S]*false,[\s\S]*null/);
});

test("university images are cached once on the university, not duplicated per programme", () => {
  for (const field of [
    "cover_image_url",
    "cover_image_source_url",
    "cover_image_attribution",
    "cover_image_license",
    "media_verified_at",
  ]) {
    assert.match(migration, new RegExp(field));
  }

  assert.doesNotMatch(
    migration,
    /alter table public\.orientation_research_programs[\s\S]*add column if not exists cover_image_url/,
  );
  assert.match(knowledge, /MAX_MEDIA_LOOKUPS_PER_RUN = 4/);
  assert.match(knowledge, /MEDIA_RETRY_DAYS = 30/);
  assert.match(knowledge, /findWikimediaUniversityMedia/);
  assert.match(knowledge, /\.from\("universities"\)[\s\S]*\.upsert\(rows, \{ onConflict: "canonical_key" \}\)/);
});

test("media enrichment uses Wikimedia Commons directly and never spends an OpenAI request", () => {
  assert.match(media, /https:\/\/commons\.wikimedia\.org\/w\/api\.php/);
  assert.match(media, /generator: "search"/);
  assert.match(media, /iiprop: "url\|size\|mime\|extmetadata"/);
  assert.match(media, /LicenseShortName/);
  assert.doesNotMatch(media, /openai|OPENAI_API_KEY|responses/i);
});

test("public results and verified catalogue expose only reusable university media needed by cards", () => {
  assert.match(resultTypes, /universityMedia: OrientationUniversityMedia \| null/);
  assert.match(resultService, /universityMedia: item\.verification\.candidate\.universityMedia \|\| null/);
  assert.match(catalog, /university_cover_image_url/);
  assert.match(catalog, /university_cover_image_source_url/);
  assert.match(migration, /u\.registry_status = 'verified_catalogue'/);
  assert.match(migration, /u\.cover_image_url as university_cover_image_url/);
  assert.doesNotMatch(migration, /u\.aliases as|u\.canonical_key as/);
});

test("orientation cards reuse the university media registry and centralize photo attribution", () => {
  const sharedPhoto = readFileSync(
    "src/components/orientation/OrientationRealPhoto.tsx", "utf8",
  );
  assert.match(card, /selected\\?\\.universityMedia\\?\\.coverImageUrl/);
  assert.match(card, /<OrientationRealPhoto/);
  assert.match(sharedPhoto, /media\\?\\.coverImageSourceUrl/);
  assert.match(sharedPhoto, /media\\?\\.coverImageAttribution/);
  assert.match(sharedPhoto, /media\\?\\.coverImageLicense/);
  assert.match(sharedPhoto, /<figcaption/);
});
