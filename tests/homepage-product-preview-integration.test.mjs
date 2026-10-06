import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("homepage exposes the interactive product preview in the public journey", () => {
  assert.match(page, /HomeProductPreview/);
  assert.ok(page.indexOf("<HomeProductPreview />") < page.indexOf("<HomePhotoBand"));
});

test("French homepage states the AlmaGo value and next action clearly", () => {
  assert.match(copy, /title1: "Ton projet d’études"/);
  assert.match(copy, /title3: "organisé de A à Z\."/);
  assert.match(copy, /Trouve les programmes adaptés à ton profil, prépare tes documents et suis tes candidatures depuis un seul espace\./);
  assert.match(copy, /primary: "Commencer mon projet"/);
  assert.match(copy, /secondary: "Découvrir comment ça marche"/);
});
