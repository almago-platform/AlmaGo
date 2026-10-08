import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("homepage exposes the interactive product preview in the public journey", () => {
  assert.match(page, /HomeProductPreview/);
  assert.ok(page.indexOf("<HomeProductPreview />") < page.indexOf("<HomeJourneySection"));
  assert.doesNotMatch(page, /<HomePhotoBand/);
  assert.match(page, /photo=\{copy\.home\.photo\}/);
});

test("French homepage states the AlmaGo value and next action clearly", () => {
  assert.match(copy, /title1: "Vos études"/);
  assert.match(copy, /title3: "étape par étape\."/);
  assert.match(copy, /Comparez les programmes, préparez vos documents et suivez votre projet depuis un seul espace\./);
  assert.match(copy, /primary: "Commencer mon projet"/);
  assert.match(copy, /secondary: "Découvrir comment ça marche"/);
});
