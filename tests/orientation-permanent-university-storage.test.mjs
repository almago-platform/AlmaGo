import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(file, "utf8");
const migration = read("supabase/migrations/20261010130000_orientation_public_university_photo_storage.sql");
const storage = read("src/lib/orientation-engine/discovery/university-storage.ts");
const route = read("src/app/api/orientation/university-media/route.ts");
const csp = read("src/lib/security/csp.ts");

test("storage bucket is public for licensed university photos but has no public write policy", () => {
  assert.match(migration, /insert into storage\.buckets/);
  assert.match(migration, /'orientation-university-media'/);
  assert.match(migration, /4194304/);
  assert.match(migration, /array\['image\/jpeg', 'image\/png', 'image\/webp'\]/);
  assert.doesNotMatch(migration, /create policy|authenticated.*insert|anon.*insert/i);
});

test("ingestion checks Wikimedia source and license before allowing a remote fetch", () => {
  assert.match(storage, /permittedWikimediaUrl/);
  assert.match(storage, /permittedLicense/);
  assert.match(storage, /upload\.wikimedia\.org/);
  assert.match(storage, /thumb\.wikimedia\.org/);
  assert.match(storage, /commons\.wikimedia\.org\/wiki/);
  assert.match(storage, /PHOTO_FETCH_TIMEOUT_MS = 5_000/);
  assert.match(storage, /MAX_BYTES = 4 \* 1024 \* 1024/);
  assert.match(storage, /signal: controller\.signal/);
  assert.match(storage, /content-length/);
  assert.match(storage, /image\/jpeg/);
  assert.match(storage, /image\/webp/);
  assert.match(storage, /getPublicUrl/);
  assert.doesNotMatch(storage, /OPENAI_API_KEY|process\.env\.SUPABASE_SECRET_KEY/);
});

test("known Commons cache entries are stored without new media discovery", () => {
  assert.match(route, /persistUniversityMediaFile\(supabase, row\.id, found\)/);
  assert.match(route, /Existing cached Commons photo: upgrade to durable Storage once/);
  assert.match(route, /storedUrl !== row\.cover_image_url/);
  assert.match(route, /cover_image_url: storedUrl/);
  assert.match(route, /cover_image_source_url: found\.coverImageSourceUrl/);
  assert.match(route, /cover_image_attribution: found\.coverImageAttribution/);
  assert.match(route, /cover_image_license: found\.coverImageLicense/);
  assert.match(storage, /return media\.coverImageUrl;/);
});

test("image CSP authorizes configured Supabase URL, never an arbitrary origin", () => {
  assert.match(csp, /supabaseConnectSources\(env\)\.filter\(\(source\) => source\.startsWith\("http"\)\)/);
  assert.doesNotMatch(csp, /img-src[^\n]*https:\/\/\*/);
});
