import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const header = read("src/components/orientation/CandidateOrientationResultHeader.tsx");
const letter = read("src/components/orientation/OrientationLetterCard.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const copy = read("src/content/orientation-prospect-copy.ts");
const form = read("src/components/orientation/PublicOrientationForm.tsx");

test("orientation result hierarchy keeps accessible, mobile-friendly profile details", () => {
  assert.match(header, /orientation-result-hero/);
  assert.match(header, /<h1/);
  assert.match(header, /sm:grid-cols-2 xl:grid-cols-4/);
  assert.match(header, /<dl/);
  assert.match(header, /<dt/);
  assert.match(header, /<dd/);
  assert.match(header, /<details/);
  assert.match(header, /bdi dir="auto"/);
});

test("Gemini letter is legible, remains fully readable and keeps verified sources", () => {
  assert.match(letter, /orientation-letter-card/);
  assert.match(letter, /letter\.paragraphs\.map/);
  assert.match(letter, /max-w-\[71ch\]/);
  assert.match(letter, /border-s-\[3px\]/);
  assert.match(letter, /pistes\.map\(\(piste, index\)/);
  assert.match(letter, /String\(index \+ 1\)\.padStart\(2, "0"\)/);
  assert.match(letter, /piste\.institution/);
  assert.match(letter, /piste\.programme/);
  assert.match(letter, /piste\.reason/);
  assert.match(letter, /piste\.city/);
  assert.match(letter, /piste\.badge/);
  assert.match(letter, /href=\{piste\.source\}/);
  assert.match(letter, /rel="noopener noreferrer"/);
  assert.match(letter, /letter\.closing/);
  assert.match(letter, /aria-labelledby="orientation-programme-pistes-heading"/);
  assert.doesNotMatch(letter, /dangerouslySetInnerHTML/);
});

test("post-orientation delivery distinguishes sent, pending and failure without claiming an account", () => {
  assert.match(capture, /const autoEmailSent = autoEmailRequested && status === "success" && message === copy\.emailSent/);
  assert.match(capture, /const autoEmailFailed = autoEmailRequested && status === "success" && message === copy\.deliveryFailure/);
  assert.match(capture, /includedEmailSuccessTitle/);
  assert.match(capture, /includedEmailFailureTitle/);
  assert.match(capture, /automaticEmailPreparing/);
  assert.match(capture, /automaticEmailAlreadyRequested/);
  assert.match(capture, /automaticEmailRetry/);
  assert.match(capture, /role=\{status === "error" \? "alert" : "status"\}/);
  assert.match(capture, /if \(!persistentCaptureAllowed\)/);
  assert.match(capture, /const autoEmailRequested = \(includedEmailDelivery \|\| automaticEmailConsent\)/);
  assert.match(copy, /Aucun compte n’a été créé/);
});

test("continuation and Prospect creation share one explicit, accessible action", () => {
  assert.match(capture, /aria-labelledby="orientation-continue-title"/);
  assert.match(capture, /onClick=\{submitInterest\}/);
  assert.match(capture, /signupPath \? copy\.continueSubmit : copy\.interestSubmit/);
  assert.match(capture, /if \(signupPath\) window\.location\.assign\(signupPath\)/);
  assert.match(capture, /interestStatus === "success" && !signupPath/);
  assert.match(capture, /copy\.continueBoundary/);
  assert.match(capture, /copy\.optionalAccountNote/);
  assert.doesNotMatch(capture, /href=\{signupPath\}/);
  assert.doesNotMatch(capture, /id="orientation-create-account-title"/);
  assert.match(capture, /contactConsent: false/);
  assert.match(capture, /\/api\/orientation\/interest/);
  assert.match(capture, /\/api\/orientation\/prospect/);
});

test("report download is visually secondary without changing print, edit or return", () => {
  assert.match(form, /orientation-report/);
  assert.match(form, /prospectCopy\.report\.printHelp/);
  assert.match(form, /onClick=\{\(\) => printOrientationDocument\("summary"\)\}/);
  assert.match(form, /onClick=\{\(\) => setStep\(1\)\}/);
  assert.match(form, /resultActionsCopy\.pdf/);
  assert.match(form, /resultActionsCopy\.home/);
  assert.match(form, /min-h-11/);
});

test("success, failure and optional labels exist in all four locales", () => {
  for (const key of [
    "includedEmailSuccessTitle",
    "includedEmailSuccessText",
    "includedEmailFailureTitle",
    "optionalAccountLabel",
    "optionalAccountNote",
  ]) {
    const occurrences = copy.match(new RegExp(key + ":", "g")) || [];
    assert.equal(occurrences.length, 5, `${key} interface + FR/AR/EN/DE`);
  }
});

test("final result polish keeps the CTA punctuation with its title and a comfortable line length", () => {
  assert.ok(capture.includes("max-w-[54rem] text-balance"));
  assert.ok(!capture.includes("max-w-[39rem] text-xl"));
  assert.ok(copy.includes("Votre avenir en Allemagne commence ici"));
});

test("PDF status does not repeat the same sent message twice", () => {
  assert.ok(capture.includes("autoEmailSent ? copy.success : message"));
  assert.ok(copy.includes("Vos deux rapports PDF ont été envoyés à l’adresse indiquée"));
  assert.ok(copy.includes("Orientation sauvegardée. Aucun compte n’a été créé"));
});

test("result toolbar has a dedicated action row to prevent desktop orphans", () => {
  const toolbar = form.slice(form.indexOf('aria-label={resultActionsCopy.title}'));
  assert.ok(toolbar.includes('className="flex flex-col gap-4"'));
  assert.ok(toolbar.includes("sm:justify-start sm:gap-x-6"));
  assert.ok(toolbar.includes("resultActionsCopy.pdf"));
  assert.ok(toolbar.includes("resultActionsCopy.adjust"));
  assert.ok(toolbar.includes("resultActionsCopy.home"));
});
