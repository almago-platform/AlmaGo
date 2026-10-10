import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { selectStudentLifePhoto, STUDENT_LIFE_PHOTOS } from "../src/lib/orientation/media/student-life.ts";
import { universityPhotoKey } from "../src/components/orientation/useOrientationUniversityMedia.ts";

const read = (name) => readFileSync(name, "utf8");

test("real curated German student-life assets are stable and have full licensing metadata", () => {
  assert.ok(STUDENT_LIFE_PHOTOS.length >= 2);
  for (const photo of STUDENT_LIFE_PHOTOS) {
    assert.match(photo.imageUrl, /^https:\/\/upload\.wikimedia\.org\//);
    assert.match(photo.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.match(photo.license, /^CC BY-SA /);
    assert.match(photo.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\//);
    assert.ok(photo.author.length >= 3);
    assert.ok(photo.description.length >= 8);
  }
  assert.equal(selectStudentLifePhoto({bacStatus:"preparing",targetDegree:"Bachelor"}).id, "augsburg-campus");
  assert.equal(selectStudentLifePhoto({bacStatus:"obtained",targetDegree:"Bachelor"}).id, "bayreuth-campus");
  assert.equal(selectStudentLifePhoto({bacStatus:"no_bac",targetDegree:"Master"}).id, "bayreuth-campus");
});

test("canonical media keys collapse casing and whitespace for reused institutions", () => {
  assert.equal(universityPhotoKey("TU Berlin","Berlin"), universityPhotoKey(" TU BERLIN "," berlin "));
  assert.notEqual(universityPhotoKey("TU Berlin","Berlin"), universityPhotoKey("TU Berlin","Hamburg"));
});

test("the public media endpoint never inserts universities, enforces strict limits and caches previous lookups", () => {
  const route = read("src/app/api/orientation/university-media/route.ts");
  assert.match(route, /MAX_UNIVERSITIES = 20/);
  assert.match(route, /MAX_NEW_LOOKUPS = 3/);
  assert.match(route, /RETRY_MS = 30 \* 24 \* 60 \* 60/);
  assert.match(route, /shouldSearch\(row\)/);
  assert.match(route, /\.from\("universities"\)\.update\(update\)\.eq\("id", row\.id\)/);
  assert.match(route, /\.in\("name", universities\.map/);
  assert.doesNotMatch(route, /\.insert\(|\.upsert\(|\.rpc\(/);
  assert.match(route, /enforceRequestRateLimit/);
  assert.match(route, /SUPABASE_SECRET_KEY/);
  assert.match(route, /if \(!row\) \{/);
  assert.match(route, /if \(curated\) items\.push\(\{ \.\.\.requested, media: curated \}\)/);
  assert.match(route, /if \(!row\) \{[\s\S]*?continue;/);
});

test("Wikimedia discovery filters logos, insufficient dimensions and unknown licenses", () => {
  const discovery = read("src/lib/orientation-engine/discovery/university-media.ts");
  assert.match(discovery, /logo\|wordmark\|seal/);
  assert.match(discovery, /info\.width/);
  assert.match(discovery, /LicenseShortName/);
  assert.match(discovery, /if \(!license/);
  assert.match(discovery, /if \(!author/);
  assert.doesNotMatch(discovery, /OPENAI_API_KEY/);
});

test("both result modes show a real photo or an explicitly identified German campus-life illustration", () => {
  const letter = read("src/components/orientation/OrientationLetterCard.tsx");
  const personalized = read("src/components/orientation/OrientationPersonalizedWriterCard.tsx");
  const image = read("src/components/orientation/OrientationRealPhoto.tsx");
  const hook = read("src/components/orientation/useOrientationUniversityMedia.ts");
  const cta = read("src/components/orientation/ProspectCaptureCard.tsx");
  assert.match(letter, /useOrientationUniversityMedia/);
  assert.match(letter, /media: recommendation\.programme\.university\.media/);
  assert.match(letter, /<OrientationRealPhoto/);
  assert.match(personalized, /useOrientationUniversityMedia/);
  assert.ok((personalized.match(/<OrientationRealPhoto/g)||[]).length >= 2);
  assert.match(hook, /fetch\("\/api\/orientation\/university-media"/);
  assert.match(hook, /controller\.abort\(\)/);
  assert.match(image, /illustrative/);
  assert.match(image, /figcaption/);
  assert.match(image, /sourceUrl/);
  assert.match(image, /onError/);
  assert.match(cta, /<OrientationRealPhoto/);
  assert.match(cta, /selectStudentLifePhoto\(answers\)/);
  assert.match(cta, /lg:grid-cols-/);
});

test("new university media host is permitted in CSP, without broad image wildcard", () => {
  const csp = read("src/lib/security/csp.ts");
  assert.match(csp, /https:\/\/upload\.wikimedia\.org/);
  assert.match(csp, /https:\/\/thumb\.wikimedia\.org/);
  assert.doesNotMatch(csp, /img-src[^\n]*https:\/\/\*/);
});
