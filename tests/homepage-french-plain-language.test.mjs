import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const native = readFileSync("src/content/native-copy.ts", "utf8");
const branding = readFileSync("src/content/homepage-v42-copy.ts", "utf8");
const journey = readFileSync("src/components/public/HomeJourneySection.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const audit = readFileSync("docs/audits/homepage-francais-simple-2026-10-09.md", "utf8");

const frenchHome = native.slice(native.indexOf("  home: {"), native.indexOf("\nconst ar ="));
const frenchBrand = branding.slice(branding.indexOf("  fr: {"), branding.indexOf("\n  ar: {"));

test("French homepage copy uses plain-language guidance instead of administrative abstractions", () => {
  assert.match(frenchBrand, /Préparez vos études en Allemagne plus facilement/);
  assert.match(frenchBrand, /Dates importantes/);
  assert.match(frenchBrand, /données inventées/);
  assert.doesNotMatch(frenchBrand, /prestations distinctes|Échéances|organismes compétents|données fictives/);
  assert.match(frenchHome, /Rassemblez vos diplômes/);
  assert.match(frenchHome, /Vérifiez les conditions et les dates sur les sites officiels/);
  assert.match(frenchHome, /Vous n’avez pas besoin de tout préparer en même temps/);
});

test("simple French still clearly distinguishes free access, activated paid access, and official decisions", () => {
  assert.match(frenchBrand, /orientation gratuite/);
  assert.match(frenchBrand, /L’inscription gratuite n’active pas automatiquement les services payants/);
  assert.match(frenchBrand, /accepter une offre, payer et recevoir une confirmation/);
  assert.match(frenchBrand, /ne garantit ni admission ni visa/);
  assert.match(frenchHome, /Les universités décident des admissions et les autorités décident des visas/);
});

test("visual polish does not replace the six original photographs or claim completed user research", () => {
  assert.equal((journey.match(/https:\/\/images\.pexels\.com\/photos/g) || []).length, 6);
  assert.match(css, /V4\.4 final polish — visual rhythm only/);
  assert.match(audit, /n'est \*\*pas un audit de tout le site\*\*/);
  assert.match(audit, /pas encore réalisée/);
});
