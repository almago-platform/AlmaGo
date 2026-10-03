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
  assert.ok(page.indexOf("<HomeQuickAccess quick={copy.home.quick} />") < page.indexOf("<HomePhotoBand photo={copy.home.photo} />"));
  assert.ok(page.indexOf("<HomePhotoBand photo={copy.home.photo} />") < page.indexOf("<HomeJourneySection"));
  assert.ok(band.includes("6684514"));
  assert.ok(band.includes("5965674"));
  assert.ok(band.includes("5553958"));
});

test("current hero uses a high-resolution campus image without claiming a German location", () => {
  assert.ok(hero.includes("7972313"));
  assert.ok(hero.includes("quality={90}"));
  assert.ok(!hero.includes("German campus"));
});

test("current quick access exposes five actions", () => {
  assert.equal(quick.split('icon: "').length - 1, 5);
  assert.ok(quick.includes("quick.items.map"));
  assert.ok(quick.includes("key={title}"));
  assert.ok(nativeCopy.includes('"Comparer les programmes"'));
  assert.ok(nativeCopy.includes('"Voir les questions"'));
});

test("V6 journey renders six photographic cards", () => {
  assert.equal(journey.split("https://images.pexels.com/photos/").length - 1, 6);
  assert.ok(journey.includes("className={s.stepMedia}"));
  assert.ok(journey.includes("className={s.stepBody}"));
});

test("V6 has responsive visual-density styling", () => {
  assert.ok(css.includes("grid-template-columns: 1.15fr 0.9fr 1.05fr"));
  assert.ok(css.includes("background: #252a2d"));
  assert.ok(css.includes("@media (max-width: 599px)"));
});


test("premium journey connects the six public steps and becomes a mobile timeline", () => {
  assert.ok(journey.includes("className={s.journeyRail}"));
  assert.ok(journey.includes("className={s.journeyRailStep}"));
  assert.ok(journey.includes("data-step={String(index + 1).padStart(2, \"0\")}"));
  assert.match(css, /\.journeyRail\s*\{[\s\S]*grid-template-columns:\s*repeat\(6/);
  assert.match(css, /\.journey \.stepCard:hover/);
  assert.match(css, /\.journey \.stepCard:last-child/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.journey \.steps::before/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.journey \.stepIndex[\s\S]*left:\s*-46px/);
  assert.match(css, /\.journey \.journeyFoot a[\s\S]*background:\s*var\(--brand\)/);
});
