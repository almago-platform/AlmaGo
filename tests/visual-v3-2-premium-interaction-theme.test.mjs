import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const designSystem = readFileSync("src/app/design-system.css", "utf8");
const button = readFileSync("src/components/ui/Button.tsx", "utf8");
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const orientation = readFileSync("src/app/prospect/orientation/page.tsx", "utf8");
const documents = readFileSync("src/components/prospect/StarterDocumentsPanel.tsx", "utf8");
const qualification = readFileSync("src/components/prospect/ProspectQualificationSummary.tsx", "utf8");
const roadmap = readFileSync("src/app/prospect/roadmap/page.tsx", "utf8");
const solutions = readFileSync("src/app/prospect/solutions/page.tsx", "utf8");
const proposal = readFileSync("src/app/prospect/proposal/page.tsx", "utf8");
const offers = readFileSync("src/app/prospect/offers/page.tsx", "utf8");
const catalogue = readFileSync("src/app/prospect/catalogue/page.tsx", "utf8");

test("premium polish exposes a restrained semantic theme system", () => {
  for (const theme of [
    ".pc-theme-neutral",
    ".pc-theme-red",
    ".pc-theme-gold",
    ".pc-theme-amber",
    ".pc-theme-green",
    ".pc-theme-blue",
    ".pc-theme-ink",
    ".pc-glass",
    ".pc-premium-card",
  ]) {
    assert.ok(designSystem.includes(theme), theme);
  }
});

test("button system supports premium black actions and modern press feedback", () => {
  assert.match(button, /premium:/);
  assert.match(button, /pc-button-premium/);
  assert.match(button, /transition-\[background-color,border-color,color,box-shadow,transform,filter\]/);
  assert.match(designSystem, /\.pc-button:not\(:disabled\):active[\s\S]*scale\(0\.985\)/);
  assert.match(designSystem, /\.pc-button-primary::after/);
  assert.match(designSystem, /\.pc-button-premium::after/);
});

test("motion effects are neutralized for reduced-motion users", () => {
  assert.match(
    designSystem,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.pc-premium-card[\s\S]*\.pc-button-primary::after/,
  );
  assert.match(designSystem, /\.pc-premium-card\.pc-card-interactive:hover,[\s\S]*transform: none/);
});

test("qualification meaning controls its visual theme", () => {
  for (const pair of [
    ["needs_information", "pc-theme-amber"],
    ["needs_verification", "pc-theme-amber"],
    ["ready_for_review", "pc-theme-green"],
    ["qualified_prospect", "pc-theme-green"],
  ]) {
    assert.match(qualification, new RegExp(`${pair[0]}: "${pair[1]}"`));
  }
  assert.match(qualification, /pc-glass mt-5/);
  assert.match(qualification, /stateBadgeTheme/);
  assert.match(qualification, /warning-soft/);
  assert.match(qualification, /success-soft/);
  assert.match(qualification, /info-soft/);
});

test("documents uses its previous blank area for a guided upload workspace", () => {
  assert.match(documents, /pc-theme-blue/);
  assert.match(documents, /Avant l’envoi/);
  assert.match(documents, /Choisissez la bonne catégorie/);
  assert.match(documents, /Envoyez un fichier lisible/);
  assert.match(documents, /Suivez la validation/);
  assert.match(documents, /pc-theme-number/);
});

test("prospect surfaces use semantic themes rather than page-wide random colors", () => {
  assert.match(dashboard, /pc-theme-gold/);
  assert.match(dashboard, /pc-theme-blue/);
  assert.match(orientation, /pc-theme-neutral/);
  assert.match(orientation, /pc-theme-gold/);
  assert.doesNotMatch(orientation, /pc-theme-red/);
  assert.match(roadmap, /pc-theme-neutral/);
  assert.match(roadmap, /pc-theme-gold/);
  assert.match(roadmap, /pc-theme-green/);
  assert.match(roadmap, /buttonClassName\("premium"/);
  assert.match(solutions, /pc-theme-neutral/);
  assert.match(solutions, /pc-theme-blue/);
  assert.doesNotMatch(solutions, /pc-theme-red/);
  assert.match(proposal, /pc-theme-green/);
  assert.match(proposal, /pc-theme-neutral/);
  assert.doesNotMatch(proposal, /pc-theme-red/);
  assert.match(offers, /pc-theme-gold/);
  assert.match(catalogue, /pc-theme-gold/);
});

test("solution grids densify earlier on wide desktop layouts", () => {
  assert.match(solutions, /xl:grid-cols-3/);
  assert.doesNotMatch(solutions, /2xl:grid-cols-3/);
});
