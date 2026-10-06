import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const designSystem = read("src/app/design-system.css");
const orientation = read("src/app/prospect/orientation/page.tsx");
const proposal = read("src/app/prospect/proposal/page.tsx");
const roadmap = read("src/app/prospect/roadmap/page.tsx");
const solutions = read("src/app/prospect/solutions/page.tsx");
const qualification = read("src/components/prospect/ProspectQualificationSummary.tsx");
const responsibility = read("src/components/product/ResponsibilityStrip.tsx");
const journeyRail = read("src/components/product/JourneyRail.tsx");
const studentLanguage = read("src/components/student/StudentLanguageCoursesPanel.tsx");
const orientationLetter = read("src/components/orientation/OrientationLetterCard.tsx");
const orientationRoute = read("src/components/orientation/OrientationRouteCard.tsx");
const orientationRefinement = read("src/components/orientation/OrientationRefinementQuestionCard.tsx");
const publicOrientation = read("src/components/orientation/PublicOrientationForm.tsx");
const engine = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const writer = read("src/components/orientation/OrientationPersonalizedWriterCard.tsx");
const interestConfirm = read("src/components/orientation/FreeValidationInterestConfirm.tsx");

test("V3.2.2 adds a calm neutral theme without removing the brand action theme", () => {
  assert.match(designSystem, /\.pc-theme-neutral/);
  assert.match(designSystem, /\.pc-theme-red/);
  assert.match(designSystem, /premium-cream-soft/);
});

test("normal prospect preparation states no longer use large red washes", () => {
  for (const source of [orientation, proposal, roadmap, solutions]) {
    assert.doesNotMatch(source, /pc-theme-red/);
  }
  assert.match(orientation, /pc-theme-neutral/);
  assert.match(proposal, /pc-theme-neutral/);
  assert.match(roadmap, /pc-theme-neutral/);
  assert.match(solutions, /pc-theme-neutral/);
});

test("red remains an accent for ownership and current step, not their background", () => {
  assert.match(responsibility, /marker: "bg-\[var\(--brand\)\]"/);
  assert.match(responsibility, /shell: "bg-\[var\(--premium-cream-soft\)\]"/);
  assert.match(journeyRail, /marker: "bg-\[var\(--brand\)\]/);
  assert.match(journeyRail, /shell: "bg-\[var\(--premium-cream-soft\)\]"/);
});

test("qualification uses semantic preparation and success tones", () => {
  assert.match(qualification, /needs_information: "pc-theme-amber"/);
  assert.match(qualification, /needs_verification: "pc-theme-amber"/);
  assert.match(qualification, /ready_for_review: "pc-theme-green"/);
  assert.match(qualification, /stateBadgeTheme/);
});

test("large public and student information surfaces use calm non-red backgrounds", () => {
  assert.doesNotMatch(studentLanguage, /bg-\[var\(--brand-soft\)\]\/55 shadow-none/);
  assert.doesNotMatch(orientationLetter, /bg-\[var\(--brand-soft\)\] p-5 sm:p-7/);
  assert.doesNotMatch(orientationRoute, /bg-\[var\(--brand-soft\)\] p-5 sm:p-6/);
  assert.doesNotMatch(orientationRefinement, /bg-\[var\(--brand-soft\)\] p-4 sm:p-5/);
  assert.match(publicOrientation, /bg-\[var\(--info-soft\)\]/);
  assert.match(engine, /bg-\[var\(--premium-gold-wash\)\]/);
  assert.match(writer, /bg-\[var\(--premium-gold-wash\)\]/);
  assert.match(interestConfirm, /bg-\[var\(--success-soft\)\]/);
});
