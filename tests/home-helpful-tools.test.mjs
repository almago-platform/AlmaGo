import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const section = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const icons = readFileSync("src/components/public/HomeIcons.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("homepage keeps three helpful tools in the localized content source", () => {
  assert.ok(nativeCopy.includes('eyebrow: "Pour avancer"'));
  assert.ok(nativeCopy.includes('"Voir par où commencer"'));
  assert.ok(nativeCopy.includes('"Comparer les programmes"'));
  assert.ok(nativeCopy.includes('"Vérifier une information"'));
  assert.ok(!section.includes("Des sources visibles"));
  assert.ok(section.includes("tools.items.map"));
});

test("helpful tools use dedicated large visual icons", () => {
  assert.ok(icons.includes("certificate:"));
  assert.ok(icons.includes("university:"));
  assert.ok(icons.includes("globe:"));
  assert.ok(css.includes(".helpfulToolIcon {"));
  assert.ok(css.includes("width: 150px"));
  assert.ok(css.includes(".helpfulToolIcon svg {"));
  assert.ok(css.includes("width: 78px"));
});

test("navigation targets the localized helpful-tools section", () => {
  assert.ok(header.includes('[nav.why, "#outils"]'));
  assert.ok(nativeCopy.includes('why: "Pourquoi AlmaGo"'));
  assert.ok(!header.includes("Voir les outils utiles"));
  assert.ok(section.includes('id="outils"'));
});

test("helpful tools retain mobile stacked cards", () => {
  assert.ok(css.includes("@media (max-width: 599px)"));
  assert.ok(css.includes(".helpfulToolsGrid {"));
  assert.ok(css.includes("grid-template-columns: 1fr"));
  assert.ok(css.includes(".helpfulToolCard:focus-visible"));
});


test("premium helpful tools create a clear visual hierarchy", () => {
  assert.match(section, /className=\{s\.helpfulToolIndex\}/);
  assert.match(css, /Homepage tools \+ FAQ V2/);
  assert.match(css, /\.helpfulToolCard:first-child/);
  assert.match(css, /\.helpfulToolIndex/);
  assert.match(css, /\.helpfulToolCard:hover/);
  assert.match(css, /\.helpfulToolCard:nth-child\(2\)::before/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.helpfulToolCard[\s\S]*grid-template-columns:\s*62px minmax\(0, 1fr\)/);
});
