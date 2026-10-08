import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");

test("homepage quick access targets the relevant journey steps", () => {
  assert.match(quick, /href: "#programmes"/);
  assert.match(quick, /href: "#parcours"/);
  assert.match(quick, /href: "#faq"/);
  assert.doesNotMatch(quick, /href: "#documents"/);
  assert.doesNotMatch(quick, /href: "#depart"/);
  assert.match(quick, /shortcuts\.map/);

  assert.match(
    journey,
    /const stepIds = \["projet", "documents", "programmes", "candidatures", "depart", "suivi"\] as const/,
  );
  assert.match(journey, /id=\{stepIds\[index\]\}/);
});

test("quick programme link describes the real comparison destination in every locale", () => {
  assert.match(nativeCopy, /\["Comparer les programmes", "Critères et sources officielles"\]/);
  assert.match(nativeCopy, /\["قارن البرامج", "الشروط والمصادر الرسمية"\]/);
  assert.match(nativeCopy, /\["Compare programmes", "Requirements and official sources"\]/);
  assert.match(nativeCopy, /\["Studiengänge vergleichen", "Voraussetzungen und offizielle Quellen"\]/);
  assert.doesNotMatch(nativeCopy, /Trouver un programme|ابحث عن برنامج|Find a programme|Studiengang finden/);
});
