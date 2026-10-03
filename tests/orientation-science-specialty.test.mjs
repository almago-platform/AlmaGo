import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const {
  restorePublicOrientationAnswers,
} = await import("../src/lib/orientation/public.ts");

const form = readFileSync(
  "src/components/orientation/PublicOrientationForm.tsx",
  "utf8",
);
const validation = readFileSync(
  "src/lib/orientation/validate.ts",
  "utf8",
);
const profileOptions = readFileSync(
  "src/lib/student/profile-options.ts",
  "utf8",
);
const knowledge = readFileSync(
  "src/lib/orientation-engine/discovery/knowledge-core.ts",
  "utf8",
);
const review = readFileSync(
  "src/lib/orientation-engine/review/core.ts",
  "utf8",
);

test("legacy science profiles restore without breaking on the new speciality field", () => {
  const restored = restorePublicOrientationAnswers({
    bacStatus: "obtained",
    bacYear: "2024",
    bacTrack: "Sciences expérimentales",
    targetDegree: "Bachelor",
    targetField: "Sciences",
  });

  assert.equal(restored.scienceSpecialty, "");
});

test("updated public flow asks for a bounded science branch while API keeps legacy blank compatible", () => {
  assert.match(profileOptions, /scienceSpecialtyOptions/);
  for (const value of [
    "biology_life_sciences",
    "chemistry",
    "physics",
    "mathematics_sciences",
    "earth_environment",
    "undecided",
  ]) {
    assert.match(profileOptions, new RegExp(value));
  }

  assert.match(form, /answers\.targetField === "Sciences"/);
  assert.match(form, /scienceSpecialtyOptions/);
  assert.match(form, /!answers\.scienceSpecialty/);
  assert.match(validation, /answers\.scienceSpecialty/);
  assert.match(validation, /answers\.targetField !== "Sciences"/);
});

test("science branch participates in discovery cache and human-review identity", () => {
  assert.match(knowledge, /scienceSpecialty/);
  assert.match(review, /scienceSpecialty/);
});
