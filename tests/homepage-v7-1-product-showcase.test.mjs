import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const product = readFileSync("src/components/public/HomeProductPreview.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("V7.1 product section replaces the empty-left layout with dense benefit cards", () => {
  assert.match(product, /productBenefits/);
  assert.match(product, /productBenefitNumber/);
  assert.match(product, /productAssurance/);
  assert.match(css, /\.productBenefits\s*\{/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 0\.72fr\) minmax\(0, 1\.28fr\)/);
});

test("V7.1 product preview is presented inside a premium dark stage", () => {
  assert.match(product, /productStage/);
  assert.match(product, /Démonstration interactive/);
  assert.match(product, /Votre dossier, en un coup d’œil/);
  assert.match(product, /Données fictives/);
  assert.match(css, /\.productStage\s*\{[\s\S]*#1c2124/);
});

test("V7.1 preserves the interactive tabs and responsive mobile layout", () => {
  assert.match(product, /role="tablist"/);
  assert.match(product, /ArrowRight/);
  assert.match(product, /ArrowLeft/);
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.productBenefits\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.productStage\s*\{/);
});
