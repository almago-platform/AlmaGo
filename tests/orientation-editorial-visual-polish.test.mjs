import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(path, "utf8");
const card = read("src/components/orientation/OrientationLetterCard.tsx");
const host = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const gemini = read("src/lib/orientation-engine/letter/gemini.ts");
const fallback = read("src/lib/orientation-engine/intelligence.ts");
const admission = read("src/lib/orientation-engine/rules.ts");

test("Bachelor first-contact welcome appears once inside the letter, with a warm accessible detail", () => {
  assert.match(card, /welcome\?: string \| null/);
  assert.match(card, /\{welcome \? \(/);
  assert.match(card, /role="note"/);
  assert.match(card, /bg-\[var\(--premium-gold-wash\)\]/);
  assert.match(card, /\{welcome\}/);
  assert.match(host, /welcome=\{isBachelorFirstContact \? bacWelcome : null\}/);
  assert.match(host, /isBachelorFirstContact && bacWelcome && personalized/);
  assert.doesNotMatch(host, /isBachelorFirstContact && bacWelcome \? \(/);
  assert.match(host, /answers\.bacStatus === "obtained"/);
  assert.match(host, /answers\.bacStatus === "preparing"/);
  assert.match(host, /answers\.bacStatus === "no_bac"/);
});

test("programme badges have their own desktop column and a consistent compact mobile layout", () => {
  assert.match(card, /sm:grid-cols-\[minmax\(0,1fr\)_auto\]/);
  assert.match(card, /grid-cols-1 items-start/);
  assert.match(card, /sm:justify-self-end/);
  assert.match(card, /whitespace-nowrap/);
  assert.match(card, /\{piste\.institution\} — \{piste\.programme\}/);
  assert.match(card, /\{piste\.badge\}/);
  assert.match(card, /href=\{piste\.source\}/);
});

test("Gemini does not repeat the continuation CTA and keeps academic uncertainty explicit", () => {
  assert.match(gemini, /Only the closing should invite the student/);
  assert.match(gemini, /avoid repeating 'verify\/check'/);
  assert.match(gemini, /State the unconfirmed academic access clearly once/);
  assert.match(gemini, /Keep all cautions, limitations/);
  assert.match(gemini, /Never invent university admission/);
  assert.match(gemini, /preserve its amount and currency/);
});

test("the deterministic FR AR EN DE fallback also avoids repeated conditional invitations", () => {
  for (const phrase of [
    "L’accès universitaire avec votre diplôme n’est pas encore confirmé.",
    "لم يتأكد بعد إمكان الالتحاق بالجامعة بشهادتك.",
    "University access with your diploma is not yet confirmed.",
    "Der Hochschulzugang mit deinem Abschluss ist noch nicht bestätigt.",
  ]) assert.ok(fallback.includes(phrase), phrase);
  assert.match(fallback, /personalBudgetNote\(locale, profile\.budgetRange\)/);
  assert.match(fallback, /Si vous choisissez de continuer avec Campus Allemagne/);
  assert.match(admission, /academic_access_review/);
  assert.doesNotMatch(gemini, /guaranteed admission/i);
});
