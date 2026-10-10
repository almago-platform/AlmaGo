import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");
const detailed = readFileSync("src/components/orientation/OrientationDetailedPrintReport.tsx", "utf8");
const catalogue = readFileSync("src/lib/orientation/email-research-pistes.ts", "utf8");
const browser = readFileSync("src/lib/orientation/browser-pdf.ts", "utf8");

test("saved detailed PDF preloads the same supplementary university research as the public page", () => {
  assert.match(page, /readSupplementalOrientationEmailPistes\(answers, personalized\.selected\)/);
  assert.match(page, /documentMode === "detailed"/);
  assert.match(page, /initialSupplemental=\{initialSupplemental\}/);
  assert.match(catalogue, /chooseDocumentedResearchPistes/);
  assert.match(catalogue, /filterSupplementalResearchPistes\(candidates, selected\)/);
  assert.match(detailed, /initialSupplemental: readonly ResearchPiste\[\] \| null/);
  assert.match(detailed, /initialSupplemental !== null/);
  assert.match(detailed, /initialSupplemental !== null \? initialSupplemental :/);
  assert.match(detailed, /supplemental\.map\(/);
});

test("browser printing waits for the hydrated supplementary data and images", () => {
  assert.match(detailed, /const skip = initialSupplemental !== null/);
  assert.match(detailed, /const ready = skip \|\|/);
  assert.match(detailed, /const detailedReady = research\.ready && loadedPhotoKey === photoKey/);
  assert.match(browser, /data-orientation-report-ready/);
  assert.match(browser, /Page\.printToPDF/);
});

test("research-only universities are never hardcoded to the user example", () => {
  assert.doesNotMatch(page, /FAU Erlangen|University of Regensburg|English Linguistics/);
  assert.doesNotMatch(detailed, /FAU Erlangen|University of Regensburg|English Linguistics/);
});
