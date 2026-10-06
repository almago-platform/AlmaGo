import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const designSystem = readFileSync("src/app/design-system.css", "utf8");
const dossier = readFileSync("src/components/product/DossierHeader.tsx", "utf8");
const prospectHero = readFileSync("src/components/prospect/ProspectPageHero.tsx", "utf8");
const journey = readFileSync("src/components/product/JourneyRail.tsx", "utf8");
const responsibility = readFileSync("src/components/product/ResponsibilityStrip.tsx", "utf8");
const programme = readFileSync("src/components/product/ProgrammeCard.tsx", "utf8");
const proposal = readFileSync("src/components/product/ProposalSummary.tsx", "utf8");
const button = readFileSync("src/components/ui/Button.tsx", "utf8");
const emptyState = readFileSync("src/components/product/PremiumEmptyState.tsx", "utf8");
const sectionHeader = readFileSync("src/components/product/PremiumSectionHeader.tsx", "utf8");
const logo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");

test("V3.2 defines semantic premium composition tokens", () => {
  for (const token of [
    "--premium-ink",
    "--premium-cream",
    "--premium-border",
    "--premium-radius-card",
    "--premium-radius-panel",
    "--premium-radius-hero",
    "--premium-shadow-card",
    "--premium-shadow-hero",
    "--premium-shadow-brand",
    "--premium-section-gap",
    "--premium-duration-base",
  ]) {
    assert.equal(designSystem.includes(token), true, token);
  }
});

test("V3.2 exposes shared premium composition primitives", () => {
  for (const className of [
    ".pc-card",
    ".pc-panel",
    ".pc-hero",
    ".pc-kicker",
    ".pc-empty-state",
    ".pc-button",
  ]) {
    assert.equal(designSystem.includes(className), true, className);
  }
  assert.match(designSystem, /prefers-reduced-motion/);
});

test("V3.2 shared product surfaces consume premium primitives", () => {
  assert.match(dossier, /pc-hero/);
  assert.match(prospectHero, /pc-hero/);
  assert.match(journey, /pc-panel/);
  assert.match(responsibility, /pc-panel/);
  assert.match(programme, /pc-card pc-card-interactive/);
  assert.match(proposal, /pc-panel/);
  assert.match(button, /pc-button/);
});

test("V3.2 provides reusable section and empty-state composition", () => {
  assert.match(emptyState, /export function PremiumEmptyState/);
  assert.match(emptyState, /pc-empty-state/);
  assert.match(sectionHeader, /export function PremiumSectionHeader/);
  assert.match(sectionHeader, /pc-kicker/);
});

test("V3.2 foundation keeps the exact approved Campus Allemagne logo assets", () => {
  assert.match(logo, /campus-allemagne-logo-approved\.png/);
  assert.match(logo, /campus-allemagne-symbol-approved\.png/);
});
