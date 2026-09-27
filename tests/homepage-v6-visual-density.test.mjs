import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const band = readFileSync("src/components/public/HomePhotoBand.tsx", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("photographic story remains between quick access and journey", () => {
  assert.match(page, /HomePhotoBand/);
  assert.match(page, /<HomeQuickAccess \/>[\s\S]*<HomePhotoBand \/>[\s\S]*<HomeJourneySection \/>/);
  assert.match(band, /6684514/);
  assert.match(band, /5965674/);
  assert.match(band, /5553958/);
});

test("current hero uses a high-resolution campus image without claiming a German location", () => {
  assert.match(hero, /7972313/);
  assert.match(hero, /quality=\{90\}/);
  assert.doesNotMatch(hero, /Germany|Deutschland|Allemagne.*campus/i);
});

test("current quick access exposes five unique actions", () => {
  const titles = [...quick.matchAll(/title: "([^"]+)"/g)].map((match) => match[1]);
  assert.equal(titles.length, 5);
  assert.equal(new Set(titles).size, 5);
  assert.match(quick, /key=\{item\.title\}/);
});

test("V6 journey renders six photographic cards", () => {
  const images = [...journey.matchAll(/image: "https:\/\/images\.pexels\.com\/photos\/(\d+)\//g)];
  assert.equal(images.length, 6);
  assert.match(journey, /className=\{s\.stepMedia\}/);
  assert.match(journey, /className=\{s\.stepBody\}/);
});

test("V6 has responsive visual-density styling", () => {
  assert.match(css, /\.photoBandGrid\s*\{[\s\S]*grid-template-columns:\s*1\.15fr 0\.9fr 1\.05fr/);
  assert.match(css, /\.stepCard\s*\{[\s\S]*background:\s*#252a2d/);
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.steps\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
