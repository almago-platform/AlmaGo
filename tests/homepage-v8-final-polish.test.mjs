import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
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
  assert.ok(page.includes("closing={copy.home.closing}"));
  assert.ok(closing.includes("closing.cta"));
});

test("V8 gives the localized FAQ a compact editorial surface", () => {
  assert.ok(nativeCopy.includes('eyebrow: "Questions utiles"'));
  assert.ok(faq.includes("className={s.faqIntro}"));
  assert.ok(page.includes("faq={copy.home.faq}"));
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


test("premium FAQ uses numbered editorial accordions and a highlighted open state", () => {
  assert.match(faq, /className=\{s\.faqNumber\}/);
  assert.match(faq, /className=\{s\.faqToggle\}/);
  assert.match(css, /\.faqIntro::after/);
  assert.match(css, /\.faqList details\[open\]/);
  assert.match(css, /\.faqList details\[open\] \.faqNumber/);
  assert.match(css, /\.faqList details\[open\] \.faqToggle/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.faqGrid[\s\S]*grid-template-columns:\s*1fr/);
});


test("tools and FAQ keep a centered reading axis", () => {
  assert.match(css, /\.helpfulToolsHeading[\s\S]*margin-inline:\s*auto[\s\S]*text-align:\s*center/);
  assert.match(css, /\.helpfulToolCard[\s\S]*text-align:\s*center/);
  assert.match(css, /\.faqGrid[\s\S]*margin-inline:\s*auto/);
  assert.match(css, /\.faqIntro[\s\S]*margin:\s*0 auto 34px[\s\S]*text-align:\s*center/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.helpfulToolCard[\s\S]*flex-direction:\s*column/);
});
