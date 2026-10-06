import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const frame = readFileSync("src/components/student/StudentPageFrame.tsx", "utf8");
const state = readFileSync("src/components/student/StudentPageState.tsx", "utf8");
const journeyHeader = readFileSync("src/components/student/StudentJourneyHeader.tsx", "utf8");
const resourceHeader = readFileSync("src/components/student/StudentResourceHeader.tsx", "utf8");
const calendar = readFileSync("src/app/student/calendar/page.tsx", "utf8");

const primaryPages = [
  "src/app/student/page.tsx",
  "src/app/student/project/page.tsx",
  "src/app/student/profile/page.tsx",
  "src/app/student/pathway/page.tsx",
  "src/app/student/checklist/page.tsx",
  "src/app/student/documents/page.tsx",
  "src/app/student/orientation/page.tsx",
  "src/app/student/applications/page.tsx",
  "src/app/student/calendar/page.tsx",
  "src/app/student/procedure/page.tsx",
  "src/app/student/language-courses/page.tsx",
  "src/app/student/finance-insurance/page.tsx",
];

test("primary student pages use one canonical responsive frame", () => {
  assert.ok(frame.includes("max-w-[92rem]"));
  assert.ok(frame.includes("px-4 py-5"));
  assert.ok(frame.includes("sm:px-6 sm:py-6"));
  assert.ok(frame.includes("xl:px-8"));

  for (const path of primaryPages) {
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes("StudentPageFrame"), `missing StudentPageFrame in ${path}`);
  }
});

test("journey and resource headers share the Product System dossier hero", () => {
  assert.ok(journeyHeader.includes("DossierHeader"));
  assert.ok(resourceHeader.includes("DossierHeader"));
  assert.ok(journeyHeader.includes("<nav"));
  assert.ok(resourceHeader.includes("<nav"));
});

test("student states share one reusable accessible presentation", () => {
  assert.ok(state.includes("StudentPageState"));
  assert.ok(state.includes('role={variant === "error" || variant === "warning" ? "alert" : undefined}'));

  for (const path of [
    "src/app/student/profile/page.tsx",
    "src/app/student/pathway/page.tsx",
    "src/app/student/checklist/page.tsx",
    "src/app/student/documents/page.tsx",
    "src/app/student/orientation/page.tsx",
    "src/app/student/applications/page.tsx",
    "src/app/student/calendar/page.tsx",
    "src/app/student/finance-insurance/page.tsx",
    "src/app/student/[section]/page.tsx",
  ]) {
    const source = readFileSync(path, "utf8");
    assert.ok(source.includes("StudentPageState"), `missing StudentPageState in ${path}`);
  }
});

test("calendar has dedicated copy for all supported locales", () => {
  assert.ok(calendar.includes("fr: {"));
  assert.ok(calendar.includes("ar: {"));
  assert.ok(calendar.includes("en: {"));
  assert.ok(calendar.includes("de: {"));
  assert.ok(calendar.includes("const t = calendarCopy[locale]"));
  assert.doesNotMatch(calendar, /const fr = locale === "fr"/);
});
