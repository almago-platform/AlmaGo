import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const faq = readFileSync("src/components/public/HomeFaqSection.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("V8 removes stale public #espace anchors", () => {
  for (const source of [header, hero, quick, closing]) assert.ok(!source.includes("#espace"));
});

test("V8 strengthens the localized final CTA and footer", () => {
  assert.ok(nativeCopy.includes('eyebrow: "Commencez simplement"'));
  assert.ok(nativeCopy.includes('title2: "par votre projet."'));
  assert.ok(nativeCopy.includes('"Prochaines étapes"'));
  assert.ok(nativeCopy.includes('independent: "Plateforme indépendante"'));
  assert.ok(nativeCopy.includes('"Outils utiles"'));
  assert.ok(closing.includes("copy.home.closing"));
});

test("V8 gives the localized FAQ a compact editorial surface", () => {
  assert.ok(nativeCopy.includes('eyebrow: "Questions utiles"'));
  assert.ok(faq.includes("className={s.faqIntro}"));
  assert.ok(faq.includes("copy.home.faq"));
  assert.ok(css.includes(".faqIntro {"));
  assert.ok(css.includes("position: sticky"));
  assert.ok(css.includes("border-radius: 10px"));
});

test("V8 keeps the header sticky and active sections offset correctly", () => {
  assert.ok(css.includes(".header {"));
  assert.ok(css.includes("position: sticky"));
  assert.ok(css.includes("#parcours,"));
  assert.ok(css.includes("scroll-margin-top: 92px"));
});

test("V8 removes obsolete trust-polish override block", () => {
  assert.ok(!css.includes("Homepage trust section polish"));
  assert.ok(!css.includes("Homepage density pass — tools + FAQ"));
});
