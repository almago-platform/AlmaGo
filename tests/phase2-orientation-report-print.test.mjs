import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");
const engineCard = readFileSync("src/components/orientation/PersonalizedOrientationEngineCard.tsx", "utf8");
const printReport = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const reviewCore = readFileSync("src/lib/orientation-engine/review/core.ts", "utf8");

test("P2.3 printed orientation report keeps canonical brand identity", () => {
  assert.match(page, /orientation-print-only/);
  assert.match(page, /<BrandLogo className="h-10 w-auto" priority \/>/);
  assert.match(page, /const copy = rebrandCopy\(orientationCopy\[locale\]\)/);
  assert.match(page, /const prospectCopy = rebrandCopy\(orientationProspectCopy\[locale\]\)/);
  assert.match(page, /const resumeCopy = rebrandCopy\(orientationResumeCopy\[locale\]\)/);
  assert.match(page, /<OrientationOnePagePrintReport answers=\{answers\} locale=\{locale\} personalized=\{personalized\} identity=\{identity\} \/>/);
  assert.match(form, /<OrientationOnePagePrintReport answers=\{answers\} locale=\{locale\} personalized=\{personalizedForPrint\} identity=\{identity\} \/>/);
});

test("P2.3 personalized PDF reuses the exact verified orientation result", () => {
  assert.match(engineCard, /onPersonalizedReady/);
  assert.match(form, /onPersonalizedReady=\{handlePersonalizedReady\}/);
  assert.match(printReport, /personalized\?: OrientationPublicPersonalizedResult \| null/);
  assert.match(printReport, /orientation-one-page-premium/);
  assert.match(printReport, /personalized\.content/);
  assert.match(page, /orientation_human_reviews/);
  assert.match(page, /projectOrientationHumanReviewBundleToPublicResult/);
  assert.match(reviewCore, /projectOrientationHumanReviewBundleToPublicResult/);
  assert.match(reviewCore, /bundle\.writer\.content/);
  assert.match(reviewCore, /verification\.facts/);
});

test("P2.3 premium PDF includes student identity and localized verified facts", () => {
  assert.match(printReport, /orientation-pdf-student/);
  assert.match(printReport, /formatIdentityDate/);
  assert.match(printReport, /premium\.birthDate/);
  assert.match(printReport, /premium\.email/);
  assert.match(printReport, /Semestre d’hiver/);
  assert.match(printReport, /Allemand C1 pour les candidats internationaux/);
  assert.match(printReport, /compactPrintText\(featuredWriter\?\.whyItFits \|\| content\.projectStatus, 420\)/);
});

test("P2.3 report has an explicit A4 print contract", () => {
  assert.match(css, /\.orientation-print-only \{[\s\S]*display: none/);
  assert.match(css, /@media print \{[\s\S]*@page \{[\s\S]*size: A4;[\s\S]*margin: 10mm/);
  assert.match(css, /\.orientation-print-page \.orientation-print-only \{[\s\S]*display: flex !important/);
  assert.match(css, /print-color-adjust: exact/);
  assert.match(css, /\.orientation-print-page \.orientation-print-hide \{[\s\S]*display: none !important/);
  assert.match(css, /\.orientation-print-page \.orientation-screen-report \{[\s\S]*display: none !important/);
  assert.match(css, /\[data-partner-prelaunch="true"\] \{[\s\S]*display: none !important/);
  assert.match(css, /\.orientation-one-page-premium \{[\s\S]*min-height: 270mm;[\s\S]*display: flex !important/);
  assert.match(css, /\.orientation-pdf-student \{[\s\S]*grid-template-columns:/);
  assert.match(css, /\.orientation-print-page \.orientation-one-page-print \{[\s\S]*display: block !important/);
  assert.match(css, /\.orientation-print-page \.skip-link \{[\s\S]*display: none !important/);
  assert.match(css, /\.orientation-print-page \.eyebrow \{[\s\S]*letter-spacing: 0 !important/);
});

test("P2.3 printed report keeps web-only navigation and sensitive resume actions out of the PDF", () => {
  assert.match(form, /className="skip-link orientation-print-hide"/);
  assert.match(page, /orientation-print-hide[\s\S]*OrientationReportActions/);
  assert.match(page, /orientation-print-hide[\s\S]*href=\{signupHref\}/);
});


test("P2.3 print shell removes screen viewport height so A4 does not gain a blank second page", () => {
  assert.match(css, /\.orientation-print-page \{[\s\S]*min-height: 0 !important;[\s\S]*height: auto !important/);
  assert.match(css, /\.orientation-print-page main \{[\s\S]*min-height: 0 !important;[\s\S]*height: auto !important/);
});
