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
  assert.doesNotMatch(header, /#espace/);
  assert.doesNotMatch(hero, /#espace/);
  assert.doesNotMatch(quick, /#espace/);
  assert.doesNotMatch(closing, /#espace/);
});

test("V8 strengthens the localized final CTA and footer", () => {
  assert.match(nativeCopy, /eyebrow: "Commencez simplement"/);
  assert.match(nativeCopy, /title2: "par votre projet."/);
  assert.match(nativeCopy, /"Prochaines étapes"/);
  assert.match(nativeCopy, /independent: "Plateforme indépendante"/);
  assert.match(nativeCopy, /"Outils utiles"/);
  assert.match(closing, /copy.home.closing/);
});

test("V8 gives the localized FAQ a compact editorial surface", () => {
  assert.match(nativeCopy, /eyebrow: "Questions utiles"/);
  assert.match(faq, /className={s.faqIntro}/);
  assert.match(faq, /copy.home.faq/);
  assert.match(css, /.faqIntros*{[sS]*position:s*sticky/);
  assert.match(css, /.faqLists*{[sS]*border-radius:s*10px/);
});

test("V8 keeps the header sticky and active sections offset correctly", () => {
  assert.match(css, /.headers*{[sS]*position:s*sticky/);
  assert.match(css, /#parcours,[sS]*scroll-margin-top:s*92px/);
});

test("V8 removes obsolete trust-polish override block", () => {
  assert.doesNotMatch(css, /Homepage trust section polish/);
  assert.doesNotMatch(css, /Homepage density pass — tools + FAQ/);
});
