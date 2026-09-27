import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const quick = readFileSync("src/components/public/HomeQuickAccess.tsx", "utf8");
const faq = readFileSync("src/components/public/HomeFaqSection.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("V8 removes stale public #espace anchors", () => {
  assert.doesNotMatch(header, /#espace/);
  assert.doesNotMatch(hero, /#espace/);
  assert.doesNotMatch(quick, /#espace/);
  assert.doesNotMatch(closing, /#espace/);
});

test("V8 strengthens the final CTA and footer", () => {
  assert.match(closing, /Votre projet commence/);
  assert.match(closing, /par une direction claire/);
  assert.match(closing, /Projet académique/);
  assert.match(closing, /Plateforme indépendante/);
  assert.match(closing, /Outils utiles/);
});

test("V8 gives the FAQ a compact editorial surface", () => {
  assert.match(faq, /Questions essentielles/);
  assert.match(faq, /className=\{s\.faqIntro\}/);
  assert.match(css, /\.faqIntro\s*\{[\s\S]*position:\s*sticky/);
  assert.match(css, /\.faqList\s*\{[\s\S]*border-radius:\s*10px/);
});

test("V8 keeps the header sticky and active sections offset correctly", () => {
  assert.match(css, /\.header\s*\{[\s\S]*position:\s*sticky/);
  assert.match(css, /#parcours,[\s\S]*scroll-margin-top:\s*92px/);
});

test("V8 removes obsolete trust-polish override block", () => {
  assert.doesNotMatch(css, /Homepage trust section polish/);
  assert.doesNotMatch(css, /Homepage density pass — tools \+ FAQ/);
});
