import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const section = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const icons = readFileSync("src/components/public/HomeIcons.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("homepage keeps three helpful tools in the localized content source", () => {
  assert.match(nativeCopy, /eyebrow: "Pour avancer"/);
  assert.match(nativeCopy, /"Voir par où commencer"/);
  assert.match(nativeCopy, /"Comparer les programmes"/);
  assert.match(nativeCopy, /"Vérifier une information"/);
  assert.doesNotMatch(section, /Des sources visibles/);
  assert.match(section, /tools.items.map/);
});

test("helpful tools use dedicated large visual icons", () => {
  assert.match(icons, /certificate:/);
  assert.match(icons, /university:/);
  assert.match(icons, /globe:/);
  assert.match(css, /.helpfulToolIcons*{[sS]*width:s*150px/);
  assert.match(css, /.helpfulToolIcon svgs*{[sS]*width:s*78px/);
});

test("navigation targets the localized helpful-tools section", () => {
  assert.match(header, /[nav.why, "#outils"]/);
  assert.match(nativeCopy, /why: "Pourquoi AlmaGo"/);
  assert.doesNotMatch(header, /Voir les outils utiles/);
  assert.match(section, /id="outils"/);
});

test("helpful tools retain mobile stacked cards", () => {
  assert.match(css, /@media (max-width: 599px)[sS]*.helpfulToolsGrids*{[sS]*grid-template-columns:s*1fr/);
  assert.match(css, /.helpfulToolCard:focus-visible/);
});
