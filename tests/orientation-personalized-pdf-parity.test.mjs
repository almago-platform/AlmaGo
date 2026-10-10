import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const screen = readFileSync("src/components/orientation/OrientationPersonalizedWriterCard.tsx", "utf8");
const print = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const attachments = readFileSync("src/lib/orientation/pdf-attachments.ts", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");
const human = readFileSync("src/lib/orientation-engine/writer/candidate-priority.ts", "utf8");

test("premium A4 print inherits the same profile-specific priority as the browser and never invents C1 for Bac in progress", () => {
  assert.match(screen, /orientationCandidatePriority\(answers, locale\)/);
  assert.match(print, /orientationCandidatePriority\(answers, locale\)/);
  assert.match(print, /candidatePriority\?\.title \|\| content\.mainPriority\.title/);
  assert.match(print, /candidatePriority\?\.text \|\| content\.mainPriority\.text/);
  assert.match(print, /candidatePriority\?\.yourStep \|\| content\.mainPriority\.nextStep/);
  assert.match(print, /index === 0 && candidatePriority \? candidatePriority\.yourStep : item\.text/);
  assert.match(human, /Bac est votre priorité/);
  assert.doesNotMatch(human, /C1 exigé|B2 exigé/);
});

test("only one warm Bac greeting appears in personalised A4 print", () => {
  assert.match(print, /openingAlreadyGreets/);
  assert.match(print, /humanMessage && !openingAlreadyGreets/);
  assert.match(print, /content\.opening\.trim\(\)/);
  assert.match(print, /bon courage\|félicitations/);
});

test("unverified research option description never copies preliminary admission-probability marketing into the A4 print", () => {
  assert.match(print, /unqualifiedWhy\.split\(/);
  assert.match(print, /première estimation campus allemagne/);
  assert.match(print, /compactPrintText\(printWhy, 420\)/);
});

test("PDF includes a visible, clickable continuation link after the counsellor note, localized for all users", () => {
  for (const label of ["Pour continuer", "لمتابعة مشروعك", "Continue your project", "Projekt fortsetzen"]) {
    assert.ok(print.includes(label), label);
  }
  assert.match(print, /href="https:\/\/campusallemagne\.tn\/orientation"/);
  assert.match(css, /\.orientation-pdf-continue/);
});

test("emailed orientation PDF uses the same safe declared-profile priority without altering the separate candidate report", () => {
  assert.match(attachments, /import \{ orientationCandidatePriority \}/);
  assert.match(attachments, /orientationCandidatePriority\(input\.answers, input\.locale\)/);
  assert.match(attachments, /candidatePriority\?\.title \|\| content\.mainPriority\.title/);
  assert.match(attachments, /candidatePriority\?\.text \|\| content\.mainPriority\.text/);
  assert.match(attachments, /candidatePriority\?\.yourStep \|\| content\.mainPriority\.nextStep/);
  assert.match(attachments, /function buildCandidatePdf/);
  assert.match(attachments, /function buildOrientationPdf/);
});
