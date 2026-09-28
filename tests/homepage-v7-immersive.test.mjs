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
  assert.match(hero, /7972313/);
  assert.match(hero, /heroBackdrop/);
  assert.match(hero, /heroShade/);
  assert.match(hero, /quality={90}/);
  assert.match(nativeCopy, /exampleAria: "Exemple de dossier AlmaGo"/);
  assert.match(css, /.heros*{[sS]*min-height:s*610px/);
  assert.match(css, /.heroShades*{[sS]*linear-gradient/);
});

test("V7 keeps localized copy and product proof integrated inside the hero", () => {
  assert.match(hero, /copy.home.hero/);
  assert.match(nativeCopy, /eyebrow: "Étudier en Allemagne, étape par étape."/);
  assert.match(nativeCopy, /title3: "plus clair."/);
  assert.match(nativeCopy, /exampleTitle: "Votre dossier avance"/);
  assert.match(nativeCopy, /["Mes candidatures", "À suivre", ""]/);
  assert.match(css, /.hero .heroDossiers*{[sS]*position:s*absolute/);
});

test("current homepage places quick access and the visual pathway immediately after the hero", () => {
  assert.match(page, /<HomeHero />[sS]*<HomeQuickAccess />[sS]*<HomePhotoBand />[sS]*<HomeJourneySection />/);
  const links = [...quick.matchAll(/{ href: "([^"]+)", icon:/g)];
  assert.equal(links.length, 5);
  assert.match(css, /.quickLinkss*{[sS]*repeat(5/);
});

test("V7 follow-up section uses three visual academic cards", () => {
  const images = [...band.matchAll(/https://images.pexels.com/photos/(d+)//g)];
  assert.equal(images.length, 3);
  assert.match(nativeCopy, /eyebrow: "Votre projet d’études d’abord"/);
  assert.match(nativeCopy, /title1: "Préparez la suite"/);
  assert.match(css, /.photoBandLayouts*{[sS]*grid-template-columns/);
});

test("current public framing keeps independence visible without a legacy utility strip", () => {
  assert.match(nativeCopy, /independent: "Plateforme indépendante"/);
  assert.match(nativeCopy, /Les admissions, visas et autres décisions officielles appartiennent/);
  assert.match(closing, /footer.independent/);
  assert.doesNotMatch(header, /Comprendre notre rôle/);
});

test("V7 retains responsive hero and card behavior", () => {
  assert.match(css, /@media (max-width: 599px)[sS]*.heros*{[sS]*min-height:s*760px/);
  assert.match(css, /@media (max-width: 599px)[sS]*.photoBandGrids*{[sS]*grid-template-columns:s*1fr/);
});
