import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const ui = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const letter = read("src/lib/orientation-engine/intelligence.ts");
const gemini = read("src/lib/orientation-engine/letter/gemini.ts");
const cards = read("src/components/orientation/OrientationLetterCard.tsx");
const explanations = read("src/lib/orientation-engine/letter/programme-explanations.ts");
const print = read("src/components/orientation/OrientationOnePagePrintReport.tsx");
const cta = read("src/content/orientation-prospect-copy.ts");
const engine = read("src/lib/orientation-engine/rules.ts");

test("human opening uses only the actual bac status; no congratulation for missing or preparing bac", () => {
  assert.match(ui, /answers\.bacStatus === "obtained"\s*\? t\.bacObtained/);
  assert.match(ui, /answers\.bacStatus === "preparing"\s*\? t\.bacPreparing/);
  assert.match(ui, /answers\.bacStatus === "no_bac"\s*\? t\.bacNoBac/);
  assert.match(ui, /welcome=\{isBachelorFirstContact \? bacWelcome : null\}/);
  assert.match(ui, /geographicFallback && !personalized/);
  assert.doesNotMatch(ui, /isBachelorFirstContact && bacWelcome && personalized/);
  for (const message of [
    "Félicitations pour votre bac !",
    "Bon courage pour la préparation de votre bac !",
    "Chaque parcours a son point de départ.",
    "مبروك نجاحك في البكالوريا!",
    "بالتوفيق في تحضير البكالوريا!",
    "Congratulations on your Baccalaureate!",
    "Best of luck as you prepare",
    "Herzlichen Glückwunsch",
    "Viel Erfolg bei der Vorbereitung",
  ]) assert.ok(ui.includes(message), message);
});

test("first-contact technical admission checks and student to-do lists are not rendered", () => {
  assert.match(ui, /!isBachelorFirstContact && !personalized && result\.shortlist\.source === "deterministic_fallback"/);
  assert.match(ui, /!isBachelorFirstContact && onRefineAnswers/);
  assert.match(ui, /recommendation\.missingInformation/);
  assert.match(ui, /recommendation\.warnings/);
  assert.match(ui, /result\.advisor\.priorityActionCodes/);
  assert.match(cards, /t\.programmeDisclaimer/);
  assert.doesNotMatch(cards, /piste\.checks|t\.toCheck/);
  assert.match(engine, /academic_access_review/);
});

test("declared monthly budget is carried into the deterministic letter and Gemini rewrite", () => {
  for (const raw of [
    "Moins de 800 € / mois",
    "800–1 000 € / mois",
    "1 000–1 200 € / mois",
    "Plus de 1 200 € / mois",
  ]) assert.ok(letter.includes(raw), raw);
  assert.match(letter, /personalBudgetNote\(locale, profile\.budgetRange\)/);
  assert.match(letter, /\[copy\.city, budgetNote\]\.filter\(Boolean\)/);
  assert.match(letter, /sans présumer du coût réel de chaque ville/);
  assert.match(gemini, /preserve its amount and currency/);
  assert.match(gemini, /Do not claim that any city or programme is affordable/);
  assert.doesNotMatch(engine, /personalBudgetNote/);
});

test("programme cards have differentiated fields without fabricated admission promises", () => {
  assert.match(explanations, /engineeringFocus/);
  assert.match(explanations, /computerScienceFocus/);
  assert.match(explanations, /\/information engineering\//);
  assert.match(explanations, /\/computer science\//);
  assert.match(cards, /not confirmed admissions|pas des admissions confirmées/);
  assert.match(cards, /href=\{piste\.source\}/);
  assert.doesNotMatch(cards, /admission garantie|acceptation garantie/i);
});

test("CTA is welcoming and explicitly optional in FR, AR, EN and DE", () => {
  for (const heading of [
    "Votre avenir en Allemagne commence ici",
    "مستقبلك الدراسي في ألمانيا يبدأ من هنا",
    "Your future in Germany starts here",
    "Deine Zukunft in Deutschland beginnt hier",
  ]) assert.ok(cta.includes(heading), heading);
  assert.match(cta, /si vous le souhaitez/);
  assert.match(cta, /Aucun paiement n’est demandé/);
  assert.match(cta, /une proposition et une validation séparées/);
});

test("both printable layouts include the appropriate bac encouragement and preserve real official sources", () => {
  assert.match(print, /const humanMessage =/);
  assert.match(print, /answers\.bacStatus as "obtained" \| "preparing" \| "no_bac"/);
  assert.match(print, /orientation-pdf-hero-opening font-semibold/);
  assert.match(print, /orientation-one-page-profile/);
  assert.match(print, /humanMessage \?/);
  assert.match(print, /copy\.disclaimer/);
});
