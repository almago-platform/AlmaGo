import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const band = readFileSync("src/components/public/HomePhotoBand.tsx", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("photographic story remains between quick access and journey", () => {
  assert.match(page, /HomePhotoBand/);
  assert.match(page, /<HomeQuickAccess />[sS]*<HomePhotoBand />[sS]*<HomeJourneySection />/);
  assert.match(band, /6684514/);
  assert.match(band, /5965674/);
  assert.match(band, /5553958/);
});

test("current hero uses a high-resolution campus image without claiming a German location", () => {
  assert.match(hero, /7972313/);
  assert.match(hero, /quality={90}/);
  assert.doesNotMatch(hero, /Germany|Deutschland|Allemagne.*campus/i);
});

test("current quick access exposes five unique actions", () => {
  const links = [...quick.matchAll(/{ href: "([^"]+)", icon:/g)].map((match) => match[1]);
  assert.equal(links.length, 5);
  assert.match(quick, /quick.items.map/);
  assert.match(quick, /key={title}/);
  assert.match(nativeCopy, /"Trouver un programme"/);
  assert.match(nativeCopy, /"Voir les questions"/);
});

test("V6 journey renders six photographic cards", () => {
  const images = [...journey.matchAll(/https://images.pexels.com/photos/(d+)//g)];
  assert.equal(images.length, 6);
  assert.match(journey, /className={s.stepMedia}/);
  assert.match(journey, /className={s.stepBody}/);
});

test("V6 has responsive visual-density styling", () => {
  assert.match(css, /.photoBandGrids*{[sS]*grid-template-columns:s*1.15fr 0.9fr 1.05fr/);
  assert.match(css, /.stepCards*{[sS]*background:s*#252a2d/);
  assert.match(css, /@media (max-width: 599px)[sS]*.stepss*{[sS]*grid-template-columns:s*1fr/);
});
