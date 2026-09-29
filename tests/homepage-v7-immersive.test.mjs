import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const band = readFileSync("src/components/public/HomePhotoBand.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("V7 uses an immersive full-width academic hero", () => {
  assert.ok(hero.includes("7972313"));
  assert.ok(hero.includes("heroBackdrop"));
  assert.ok(hero.includes("heroShade"));
  assert.ok(hero.includes("quality={90}"));
  assert.ok(nativeCopy.includes('exampleAria: "Exemple de dossier AlmaGo"'));
  assert.ok(css.includes("min-height: 610px"));
  assert.ok(css.includes("linear-gradient"));
});

test("V7 keeps localized copy and product proof integrated inside the hero", () => {
  assert.ok(page.includes("hero={copy.home.hero}"));
  assert.ok(nativeCopy.includes('eyebrow: "Étudier en Allemagne, étape par étape."'));
  assert.ok(nativeCopy.includes('title3: "plus clair."'));
  assert.ok(nativeCopy.includes('exampleTitle: "Votre dossier avance"'));
  assert.ok(nativeCopy.includes('["Mes candidatures", "À suivre", ""]'));
  assert.ok(css.includes(".hero .heroDossier"));
  assert.ok(css.includes("position: absolute"));
});

test("current homepage places quick access and the visual pathway immediately after the hero", () => {
  assert.ok(page.indexOf("<HomeHero hero=") < page.indexOf("<HomeQuickAccess quick="));
  assert.ok(page.indexOf("<HomeQuickAccess quick=") < page.indexOf("<HomePhotoBand photo="));
  assert.ok(page.indexOf("<HomePhotoBand photo=") < page.indexOf("<HomeJourneySection journey="));
  assert.equal(quick.split('icon: "').length - 1, 5);
  assert.ok(css.includes("repeat(5"));
});

test("V7 follow-up section uses three visual academic cards", () => {
  assert.equal(band.split("https://images.pexels.com/photos/").length - 1, 3);
  assert.ok(nativeCopy.includes('eyebrow: "Votre projet d’études d’abord"'));
  assert.ok(nativeCopy.includes('title1: "Préparez la suite"'));
  assert.ok(css.includes(".photoBandLayout"));
});

test("current public framing keeps independence visible without a legacy utility strip", () => {
  assert.ok(nativeCopy.includes('independent: "Plateforme indépendante"'));
  assert.ok(nativeCopy.includes("Les admissions, visas et autres décisions officielles appartiennent"));
  assert.ok(closing.includes("footer.independent"));
  assert.ok(!header.includes("Comprendre notre rôle"));
});

test("V7 retains responsive hero and card behavior", () => {
  assert.ok(css.includes("@media (max-width: 599px)"));
  assert.ok(css.includes("min-height: 760px"));
  assert.ok(css.includes(".photoBandGrid"));
});
