import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const recommendation = readFileSync("src/components/prospect/ProspectProgrammeRecommendationCard.tsx", "utf8");
const catalogueCard = readFileSync("src/components/prospect/ProspectProgrammeCatalogueCard.tsx", "utf8");
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const orientation = readFileSync("src/app/prospect/orientation/page.tsx", "utf8");
const header = readFileSync("src/components/product/PremiumSectionHeader.tsx", "utf8");
const designSystem = readFileSync("src/app/design-system.css", "utf8");
const copy = readFileSync("src/content/prospect-hub-copy.ts", "utf8");

test("positive programme matches use success semantics instead of brand red", () => {
  assert.match(recommendation, /premium-green-wash/);
  assert.match(recommendation, /success-strong/);
  assert.match(recommendation, /bg-\[var\(--success\)\]/);
  assert.doesNotMatch(recommendation, /projectMatch[\s\S]{0,220}brand-soft/);

  assert.match(catalogueCard, /projectMatch \? "bg-\[var\(--premium-green-wash\)\]/);
  assert.match(catalogueCard, /success-strong/);
  assert.match(catalogueCard, /projectMatch \? "bg-\[var\(--success\)\]/);
});

test("recommended section labels opt into a success kicker", () => {
  assert.match(header, /eyebrowTone\?: "brand" \| "success"/);
  assert.match(header, /pc-kicker-success/);
  assert.match(designSystem, /\.pc-kicker-success/);
  assert.match(designSystem, /color: var\(--success-strong\)/);
  assert.match(catalogue, /eyebrowTone="success"/);
  assert.match(orientation, /eyebrowTone="success"/);
  assert.match(dashboard, /text-\[var\(--success-strong\)\]/);
});

test("positive project-match wording is concise in every supported locale", () => {
  assert.match(copy, /projectMatch: "Correspond à votre projet"/);
  assert.match(copy, /projectMatch: "Matches your project"/);
  assert.match(copy, /projectMatch: "Passt zu deinem Projekt"/);
  assert.match(copy, /projectMatch: "يتوافق مع مشروعك"/);
  assert.doesNotMatch(copy, /Correspond à des critères de votre projet/);
});

test("requirements to verify remain warning-toned instead of red", () => {
  assert.match(recommendation, /text-\[var\(--warning-strong\)\]/);
  assert.match(catalogueCard, /text-\[var\(--warning-strong\)\]/);
});
