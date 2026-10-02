import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261002213000_orientation_human_review_bundle.sql",
  "utf8",
);
const store = readFileSync(
  "src/lib/orientation-engine/review/store.ts",
  "utf8",
);
const resultService = readFileSync(
  "src/lib/orientation-engine/result/service.ts",
  "utf8",
);
const reviewApi = readFileSync(
  "src/app/api/admin/orientation/reviews/[id]/route.ts",
  "utf8",
);
const adminUi = readFileSync(
  "src/components/admin/AdminOrientationHumanReviewQueue.tsx",
  "utf8",
);
const capture = readFileSync(
  "src/components/orientation/ProspectCaptureCard.tsx",
  "utf8",
);
const prospectRoute = readFileSync(
  "src/app/api/orientation/prospect/route.ts",
  "utf8",
);

test("F fingerprints the exact academic profile without identity fields", () => {
  const coreSource = readFileSync(
    "src/lib/orientation-engine/review/core.ts",
    "utf8",
  );

  assert.match(coreSource, /createHash\("sha256"\)/);
  assert.match(coreSource, /buildOrientationHumanReviewProfileFingerprint/);
  assert.match(coreSource, /bacStatus: profile\.bacStatus/);
  assert.match(coreSource, /generalAverage: profile\.generalAverage/);
  assert.match(coreSource, /germanLevel: profile\.germanLevel/);
  assert.match(coreSource, /preferredCities: \[\.\.\.profile\.preferredCities\]\.sort\(\)/);

  for (const forbidden of [
    "email",
    "phone",
    "passport",
    "first_name",
    "last_name",
    "postal_address",
  ]) {
    assert.doesNotMatch(coreSource, new RegExp(forbidden, "i"));
  }
});

test("F persists an admin-only A/B/C/D bundle rather than publishing recommendations", () => {
  assert.match(migration, /create table public\.orientation_human_reviews/);
  assert.match(migration, /alter table public\.orientation_human_reviews enable row level security/);
  assert.match(migration, /revoke all on table public\.orientation_human_reviews[\s\S]*from public, anon, authenticated/);
  assert.match(migration, /orientation human reviews admin read/);
  assert.match(migration, /orientation human reviews admin read/);
  assert.match(
    migration,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/,
  );
  assert.match(migration, /program_recommendations publication/);

  assert.doesNotMatch(resultService, /\.from\("program_recommendations"\)/);
  assert.match(resultService, /buildOrientationHumanReviewBundle/);
  assert.match(resultService, /persistOrientationHumanReview/);
});

test("F links a review to a saved orientation only when the academic fingerprint matches", () => {
  assert.match(store, /buildOrientationHumanReviewProfileFingerprint/);
  assert.match(store, /\.eq\("profile_fingerprint", fingerprint\)/);
  assert.match(store, /\.is\("orientation_id", null\)/);
  assert.match(capture, /reviewId/);
  assert.match(prospectRoute, /linkOrientationHumanReview/);
  assert.match(prospectRoute, /profile: answers/);
  assert.match(prospectRoute, /orientationId: String\(orientation\.id\)/);
});

test("F counselor decisions are bounded to non-unknown B programmes and at most four pistes", () => {
  assert.match(reviewApi, /verification\.overallStatus !== "unknown"/);
  assert.match(reviewApi, /keys\.length > 4/);
  assert.match(reviewApi, /approvedSelection\.length < 1 \|\| approvedSelection\.length > 4/);
  assert.match(reviewApi, /allowed\.has\(key\)/);
  assert.match(reviewApi, /reviewed_by: user\.id/);
  assert.match(reviewApi, /createPrivilegedSupabaseClient/);
  assert.doesNotMatch(reviewApi, /program_recommendations/);
});

test("F admin surface shows A, B, C and D while keeping manual publication separate", () => {
  assert.match(adminUi, /A — candidats découverts/);
  assert.match(adminUi, /B — faits vérifiés/);
  assert.match(adminUi, /C — shortlist déterministe/);
  assert.match(adminUi, /D — texte généré/);
  assert.match(adminUi, /Confirmer après audit/);
  assert.match(adminUi, /Demander correction/);
  assert.match(adminUi, /Rejeter cette revue/);
  assert.match(adminUi, /ne bloque ni ne retire rétroactivement le résultat déjà affiché/);
  assert.match(adminUi, /ne publie jamais automatiquement une recommandation étudiant/);
  assert.match(adminUi, /workflow de publication manuel/);
});
