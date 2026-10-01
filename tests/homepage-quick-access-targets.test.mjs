import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");

test("homepage quick access targets the relevant journey steps", () => {
  assert.match(quick, /href: "#programmes"/);
  assert.match(quick, /href: "#parcours"/);
  assert.match(quick, /href: "#documents"/);
  assert.match(quick, /href: "#depart"/);
  assert.match(quick, /href: "#faq"/);

  assert.match(
    journey,
    /const stepIds = \["projet", "documents", "programmes", "candidatures", "depart", "suivi"\] as const/,
  );
  assert.match(journey, /id=\{stepIds\[index\]\}/);
});
