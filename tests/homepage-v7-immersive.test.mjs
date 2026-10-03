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
const landing = readFileSync("src/components/public/HomeLanding.tsx", "utf8");
const landingCopy = readFileSync("src/content/homepage-redesign-copy.ts", "utf8");
const redesignCss = readFileSync("src/components/public/HomepageRedesign.module.css", "utf8");

test("V7 uses an immersive full-width academic hero", () => {
  assert.ok(hero.includes("7972313"));
  assert.ok(hero.includes("heroBackdrop"));
  assert.ok(hero.includes("heroShade"));
  assert.ok(hero.includes("quality={90}"));
  assert.ok(nativeCopy.includes('exampleAria: "Exemple de dossier AlmaGo"'));
  assert.ok(css.includes("min-height: 610px"));
  assert.ok(css.includes("linear-gradient"));
});

test("current homepage keeps localized product proof integrated inside the hero", () => {
  assert.ok(page.includes("<HomeLanding copy={landingCopy} primaryHref={primaryHref} />"));
  assert.ok(landing.includes("DashboardPreview"));
  assert.ok(landing.includes("copy.dashboard.cards"));
  assert.ok(landingCopy.includes('title: "Ton projet d’études en Allemagne, organisé de A à Z."'));
  assert.ok(landingCopy.includes('primary: "Commencer mon projet"'));
  assert.ok(redesignCss.includes(".dashboardShell"));
});

test("current homepage follows the product-led clarity sequence", () => {
  assert.ok(landing.indexOf("<Hero") < landing.indexOf("<Steps"));
  assert.ok(landing.indexOf("<Steps") < landing.indexOf("<Benefits"));
  assert.ok(landing.indexOf("<Benefits") < landing.indexOf("<ProductShowcase"));
  assert.ok(landing.indexOf("<ProductShowcase") < landing.indexOf("<Sources"));
  assert.ok(landing.indexOf("<Sources") < landing.indexOf("<Faq"));
  assert.ok(landing.indexOf("<Faq") < landing.indexOf("<FinalCta"));
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
