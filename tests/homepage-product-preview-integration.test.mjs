import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const native = readFileSync("src/content/native-copy.ts", "utf8");
const preview = readFileSync("src/components/public/HomeExperiencePreview.tsx", "utf8");

test("V4.2 replaces the stale mock dashboard with a two-level product explanation", () => {
  assert.match(page, /<HomeExperiencePreview/);
  assert.doesNotMatch(page, /<HomeProductPreview/);
  assert.ok(page.indexOf("<HomeJourneySection") < page.indexOf("<HomeExperiencePreview"));
  assert.match(preview, /role="tablist"/);
  assert.match(preview, /role="tabpanel"/);
  assert.match(preview, /aria-selected=\{selected\}/);
  assert.match(preview, /handleTabKeys/);
});

test("French homepage keeps the approved clear hero and free orientation CTA", () => {
  assert.match(native, /title1: "Vos études"/);
  assert.match(native, /title3: "étape par étape\."/);
  assert.match(native, /Commencez par une orientation gratuite\. Découvrez les programmes possibles et choisissez la suite qui vous convient\./);
  assert.match(native, /orientationPrimary: "Faire mon orientation gratuite"/);
});
