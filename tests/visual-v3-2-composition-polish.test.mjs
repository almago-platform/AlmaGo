import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hero = readFileSync("src/components/prospect/ProspectPageHero.tsx", "utf8");
const editorial = readFileSync("src/components/prospect/ProspectEditorialPanel.tsx", "utf8");
const media = readFileSync("src/lib/prospect/media.ts", "utf8");
const offers = readFileSync("src/app/prospect/offers/page.tsx", "utf8");
const selector = readFileSync("src/components/prospect/ProspectOfferSelector.tsx", "utf8");
const proposal = readFileSync("src/app/prospect/proposal/page.tsx", "utf8");
const payment = readFileSync("src/app/prospect/payment/page.tsx", "utf8");
const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const catalogueCard = readFileSync("src/components/prospect/ProspectProgrammeCatalogueCard.tsx", "utf8");
const universityCover = readFileSync("src/components/prospect/ProspectUniversityCover.tsx", "utf8");
const css = readFileSync("src/app/prospect-v3.css", "utf8");

test("composition polish preserves the V3.2 hero while adding opt-in variants", () => {
  assert.match(hero, /variant\?: "default" \| "split" \| "compact"/);
  assert.match(hero, /prospect-page-hero pc-hero/);
  assert.match(hero, /prospect-page-hero--split/);
  assert.match(hero, /from "next\/image"/);
});

test("prospect editorial photography stays responsive and decorative by default", () => {
  assert.match(editorial, /sizes="\(min-width: 1280px\) 28vw/);
  assert.match(editorial, /quality=\{75\}/);
  assert.match(editorial, /imageAlt = ""/);
  assert.equal((media.match(/https:\/\/images\.pexels\.com\/photos\//g) ?? []).length, 4);
  assert.equal((media.match(/w=1200/g) ?? []).length, 4);
});

test("offers uses a split hero, a richer locked state and an adaptive grid", () => {
  assert.match(offers, /variant="split"/);
  assert.match(offers, /variant="compact"/);
  assert.match(offers, /ProspectEditorialPanel/);
  assert.match(offers, /prospectMedia\.offersHero/);
  assert.match(selector, /prospect-offer-grid/);
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit, minmax\(min\(100%, 20rem\), 1fr\)\)/);
});

test("proposal is visually distinct without changing proposal workflow state", () => {
  assert.match(proposal, /variant="split"/);
  assert.match(proposal, /prospectMedia\.proposalHero/);
  assert.match(proposal, /IntakeFlowCard/);
  assert.match(proposal, /proposalAvailable/);
  assert.match(proposal, /!\(!state\.intake && state\.orientationConfirmed\)/);
});

test("payment enriches only the no-purchase state and keeps server-state components", () => {
  assert.match(payment, /if \(!latest\)/);
  assert.match(payment, /prospectMedia\.paymentEmpty/);
  assert.match(payment, /ProspectEditorialPanel/);
  assert.match(payment, /DossierHeader/);
  assert.match(payment, /JourneyRail/);
  assert.match(payment, /NextActionPanel/);
  assert.match(payment, /ResponsibilityStrip/);
});

test("catalogue adapts sparse results and reduces repeated-cover dominance", () => {
  assert.match(catalogue, /prospectMedia\.catalogueHero/);
  assert.match(catalogue, /prospect-programme-grid/);
  assert.match(catalogue, /wide=\{filtered\.length === 1\}/);
  assert.match(catalogueCard, /compact=\{!wide && !projectMatch\}/);
  assert.match(catalogueCard, /wide=\{wide\}/);
  assert.match(universityCover, /wide\s*\?\s*"h-48 lg:h-full lg:min-h-\[22rem\]"/);
  assert.match(css, /\.prospect-programme-grid/);
});

test("dashboard groups decision surfaces without changing lifecycle semantics", () => {
  assert.match(dashboard, /prospect-dashboard-decision-grid/);
  assert.match(dashboard, /NextActionPanel/);
  assert.match(dashboard, /ResponsibilityStrip/);
  assert.match(dashboard, /JourneyRail/);
  assert.match(dashboard, /proposalStatus\(state\.intake, t\)/);
  assert.match(css, /\.prospect-dashboard-decision-grid/);
});
