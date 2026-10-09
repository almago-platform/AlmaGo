import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const about = readFileSync("src/components/public/HomeAboutSection.tsx", "utf8");
const copy = readFileSync("src/content/homepage-v42-copy.ts", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");

const fr = copy.slice(copy.indexOf("  fr: {"), copy.indexOf("  ar: {"));

test("open FAQ plus/minus control stays visible against its red circle", () => {
  assert.match(css, /\.home \.faqList details\[open\] summary svg\s*\{\s*color: #fffdf8;\s*background-color: var\(--home-red\)/);
  assert.match(css, /\.faqList details\[open\] summary svg\s*\{[\s\S]*?transform: rotate\(45deg\)/);
});

test("header language select receives a single clear keyboard focus ring", () => {
  assert.match(header, /<LanguageSwitcher compact/);
  assert.match(css, /\.home \.headerActions select:focus-visible\s*\{[\s\S]*?outline: 3px solid var\(--home-red\);[\s\S]*?box-shadow: none/);
  assert.match(css, /\.home \.headerActions select:focus:not\(:focus-visible\)/);
});

test("six-photo identity and readable stage captions remain unchanged", () => {
  assert.equal((journey.match(/images\.pexels\.com\/photos\//g) || []).length, 6);
  assert.match(css, /\.journey \.journeyRailStep small\s*\{[\s\S]*?font-size: 12px/);
  assert.match(css, /\.journey \.stepTopline span\s*\{[\s\S]*?font-size: 10\.5px/);
  assert.match(css, /\.journey \.stepCard p\s*\{[\s\S]*?font-size: 14px/);
});

test("shorter French copy retains correct institutional and paid-service limits", () => {
  assert.match(fr, /Nous vous aidons à préparer vos études en Allemagne, étape par étape/);
  assert.match(fr, /Les universités décident des admissions et les autorités décident des visas/);
  assert.match(fr, /Est-ce que je dois payer après l’orientation gratuite/);
  assert.match(fr, /Exemple uniquement — ce n’est pas un vrai dossier/);
  assert.match(fr, /L’inscription gratuite n’active pas automatiquement les services payants/);
  assert.match(fr, /ne garantit ni admission ni visa/);
  assert.match(about, /copy\.mission/);
  assert.doesNotMatch(about, /className=\{s\.v42Independent\}/);
});
