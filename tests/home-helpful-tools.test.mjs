import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const section = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const icons = readFileSync("src/components/public/HomeIcons.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("homepage replaces the old trust block with three helpful tools", () => {
  assert.match(section, /Outils utiles/);
  assert.match(section, /Évaluer mon point de départ/);
  assert.match(section, /Explorer les programmes/);
  assert.match(section, /Trouver les bons repères/);
  assert.doesNotMatch(section, /Des sources visibles/);
});

test("helpful tools use dedicated large visual icons", () => {
  assert.match(icons, /certificate:/);
  assert.match(icons, /university:/);
  assert.match(icons, /globe:/);
  assert.match(css, /\.helpfulToolIcon\s*\{[\s\S]*width:\s*150px/);
  assert.match(css, /\.helpfulToolIcon svg\s*\{[\s\S]*width:\s*78px/);
});

test("navigation now targets the helpful-tools section", () => {
  assert.match(header, /\["Nos repères", "#outils"\]/);
  assert.doesNotMatch(header, /Voir les outils utiles/);
  assert.doesNotMatch(header, /plateforme indépendante/);
  assert.match(section, /id="outils"/);
});

test("helpful tools retain mobile stacked cards", () => {
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.helpfulToolsGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /\.helpfulToolCard:focus-visible/);
});
