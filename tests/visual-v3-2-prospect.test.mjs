import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const orientation = readFileSync("src/app/prospect/orientation/page.tsx", "utf8");
const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const solutions = readFileSync("src/app/prospect/solutions/page.tsx", "utf8");
const offers = readFileSync("src/app/prospect/offers/page.tsx", "utf8");
const proposal = readFileSync("src/app/prospect/proposal/page.tsx", "utf8");
const roadmap = readFileSync("src/app/prospect/roadmap/page.tsx", "utf8");
const payment = readFileSync("src/app/prospect/payment/page.tsx", "utf8");
const offerSelector = readFileSync("src/components/prospect/ProspectOfferSelector.tsx", "utf8");
const starterDocuments = readFileSync("src/components/prospect/StarterDocumentsPanel.tsx", "utf8");
const recommendationCard = readFileSync("src/components/prospect/ProspectProgrammeRecommendationCard.tsx", "utf8");
const catalogueCard = readFileSync("src/components/prospect/ProspectProgrammeCatalogueCard.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");

test("Prospect V3.2 uses the premium composition primitives on core surfaces", () => {
  assert.match(dashboard, /PremiumSectionHeader/);
  assert.match(dashboard, /PremiumEmptyState/);
  assert.match(orientation, /PremiumSectionHeader/);
  assert.match(orientation, /PremiumEmptyState/);
  assert.match(catalogue, /PremiumSectionHeader/);
  assert.match(catalogue, /PremiumEmptyState/);
  assert.match(solutions, /PremiumSectionHeader/);
  assert.match(solutions, /PremiumEmptyState/);
  assert.match(offers, /ProspectEditorialPanel/);
  assert.match(proposal, /PremiumSectionHeader/);
  assert.match(proposal, /PremiumEmptyState/);
  assert.match(roadmap, /PremiumSectionHeader/);
  assert.match(payment, /PremiumSectionHeader/);
});

test("Prospect V3.2 makes sparse offer states intentional", () => {
  assert.match(offerSelector, /PremiumEmptyState/);
  assert.match(offerSelector, /pc-card pc-card-interactive/);
  assert.match(offers, /pc-waiting-strip/);
  assert.match(offers, /ProspectEditorialPanel/);
});

test("Prospect V3.2 standardizes programme and solution card interaction", () => {
  assert.match(recommendationCard, /pc-card pc-card-interactive/);
  assert.match(catalogueCard, /pc-card pc-card-interactive/);
  assert.match(solutions, /pc-card pc-card-interactive/);
  assert.match(recommendationCard, /buttonClassName/);
  assert.match(catalogueCard, /buttonClassName/);
});

test("Prospect V3.2 keeps documents inside the shared premium surface system", () => {
  assert.match(starterDocuments, /pc-panel/);
  assert.match(starterDocuments, /pc-soft-strip/);
  assert.match(starterDocuments, /buttonClassName/);
});

test("Prospect V3.2 keeps the exact approved Campus Allemagne logo assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
