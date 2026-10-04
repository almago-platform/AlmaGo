import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const verificationService = readFileSync(
  "src/lib/orientation-engine/verification/service.ts",
  "utf8",
);
const personalizedCard = readFileSync(
  "src/components/orientation/OrientationPersonalizedWriterCard.tsx",
  "utf8",
);

test("preferred-city candidates are not skipped by reusable verification cache", () => {
  assert.match(verificationService, /preferredCityCandidateAvailable/);
  assert.match(verificationService, /preferredCityCovered/);
  assert.match(verificationService, /preferredCandidatesToVerify/);
  assert.match(verificationService, /candidateMatchesPreferredCity/);
});

test("personalized result prefers selected-city options and explains widening", () => {
  assert.match(personalizedCard, /preferredOptionIds/);
  assert.match(personalizedCard, /preferredStrongOption/);
  assert.match(personalizedCard, /showCityFallback/);
  assert.match(personalizedCard, /Nous avons recherché en priorité à/);
});
