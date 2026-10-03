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
  assert.ok(hero.includes("hero.exampleTitle"));
  assert.ok(nativeCopy.includes('eyebrow: "Étudier en Allemagne, étape par étape."'));
  assert.ok(nativeCopy.includes('title3: "plus clair."'));
  assert.ok(nativeCopy.includes('exampleTitle: "Votre dossier avance"'));
  assert.ok(nativeCopy.includes('["Mes candidatures", "À suivre", ""]'));
  assert.ok(css.includes(".hero .heroDossier"));
  assert.ok(css.includes("position: absolute"));
});

test("current homepage places quick access and the visual pathway immediately after the hero", () => {
  assert.ok(page.indexOf("<HomeHero hero={copy.home.hero} />") < page.indexOf("<HomeQuickAccess quick={copy.home.quick} />"));
  assert.ok(page.indexOf("<HomeQuickAccess quick={copy.home.quick} />") < page.indexOf("<HomePhotoBand photo={copy.home.photo} />"));
  assert.ok(page.indexOf("<HomePhotoBand photo={copy.home.photo} />") < page.indexOf("<HomeJourneySection"));
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


test("full-bleed desktop hero fills the visual field without a split-layout photo card", () => {
  assert.ok(css.includes("Homepage hero — full-bleed immersive treatment"));
  assert.match(css, /@media \(min-width: 900px\)[\s\S]*\.heroBackdrop,[\s\S]*inset: 0;[\s\S]*width: 100%;[\s\S]*border-radius: 0;/);
  assert.match(css, /\.heroShade \{[\s\S]*linear-gradient/);
  assert.match(css, /\.hero \.heroCopy \{[\s\S]*color: #fffdf8/);
  assert.match(css, /\.hero \.heroDossier \{[\s\S]*background: rgba\(255, 253, 248, 0\.96\)/);
});

test("full-bleed desktop hero mirrors the Arabic composition correctly", () => {
  const fullBleed = css.slice(css.indexOf("Homepage hero — full-bleed immersive treatment"));
  assert.match(
    fullBleed,
    /:global\(html\[dir="rtl"\]\) \.hero \.heroCopy \{[\s\S]*?margin-inline-start: 0;[\s\S]*?margin-inline-end: auto;[\s\S]*?\}/,
  );
  assert.doesNotMatch(
    fullBleed,
    /:global\(html\[dir="rtl"\]\) \.hero \.heroCopy \{[\s\S]{0,220}?margin-inline-start: auto;/,
  );
  assert.match(
    fullBleed,
    /:global\(html\[dir="rtl"\]\) \.hero \.heroDossier \{\s*right: auto;\s*left: clamp\(34px, 5vw, 88px\);\s*\}/,
  );
  assert.match(
    fullBleed,
    /:global\(html\[dir="rtl"\]\) \.heroShade \{[\s\S]*?linear-gradient\(\s*270deg,/,
  );
});

