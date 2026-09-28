import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const band = readFileSync("src/components/public/HomePhotoBand.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("V7 uses an immersive full-width academic hero", () => {
  assert.match(hero, /7972313/);
  assert.match(hero, /heroBackdrop/);
  assert.match(hero, /heroShade/);
  assert.match(hero, /quality=\{90\}/);
  assert.match(hero, /Exemple de dossier AlmaGo/);
  assert.match(css, /\.hero\s*\{[\s\S]*min-height:\s*610px/);
  assert.match(css, /\.heroShade\s*\{[\s\S]*linear-gradient/);
});

test("V7 keeps copy and product proof integrated inside the hero", () => {
  assert.match(hero, /Étudier en/);
  assert.match(hero, /plus clair/);
  assert.match(hero, /Votre dossier avance/);
  assert.match(hero, /Mes candidatures/);
  assert.match(css, /\.hero \.heroDossier\s*\{[\s\S]*position:\s*absolute/);
});

test("current homepage places quick access and the visual pathway immediately after the hero", () => {
  assert.match(page, /<HomeHero \/>[\s\S]*<HomeQuickAccess \/>[\s\S]*<HomePhotoBand \/>[\s\S]*<HomeJourneySection \/>/);
  const titles = [...quick.matchAll(/title: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(titles.length, 5);
  assert.equal(new Set(titles).size, 5);
  assert.match(css, /\.quickLinks\s*\{[\s\S]*repeat\(5/);
});

test("V7 follow-up section uses three visual academic cards", () => {
  const images = [...band.matchAll(/image: "https:\/\/images\.pexels\.com\/photos\/(\d+)\//g)];
  assert.equal(images.length, 3);
  assert.match(band, /Votre projet d’études d’abord/);
  assert.match(band, /Préparez la suite/);
  assert.match(css, /\.photoBandLayout\s*\{[\s\S]*grid-template-columns/);
});

test("current public framing keeps independence visible without a legacy utility strip", () => {
  const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
  assert.match(closing, /Plateforme indépendante/);
  assert.match(closing, /Les admissions, visas et autres décisions officielles appartiennent/);
  assert.doesNotMatch(header, /Comprendre notre rôle/);
});

test("V7 retains responsive hero and card behavior", () => {
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.hero\s*\{[\s\S]*min-height:\s*760px/);
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.photoBandGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
