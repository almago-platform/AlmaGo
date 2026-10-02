import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("P2.3 printed orientation report keeps canonical brand identity", () => {
  assert.match(page, /orientation-print-only/);
  assert.match(page, /<BrandLogo className="h-10 w-auto" priority \/>/);
  assert.match(page, /const copy = rebrandCopy\(orientationCopy\[locale\]\)/);
  assert.match(page, /const prospectCopy = rebrandCopy\(orientationProspectCopy\[locale\]\)/);
  assert.match(page, /const resumeCopy = rebrandCopy\(orientationResumeCopy\[locale\]\)/);
  assert.match(page, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
  assert.match(form, /orientation-print-only[\s\S]*<BrandLogo className="h-10 w-auto" priority \/>/);
});

test("P2.3 report has an explicit A4 print contract", () => {
  assert.match(css, /\.orientation-print-only \{[\s\S]*display: none/);
  assert.match(css, /@media print \{[\s\S]*@page \{[\s\S]*size: A4;[\s\S]*margin: 14mm/);
  assert.match(css, /\.orientation-print-page \.orientation-print-only \{[\s\S]*display: flex !important/);
  assert.match(css, /print-color-adjust: exact/);
  assert.match(css, /\.orientation-print-page \.orientation-print-hide \{[\s\S]*display: none !important/);
  assert.match(css, /\.orientation-print-page \.skip-link \{[\s\S]*display: none !important/);
  assert.match(css, /\.orientation-print-page \.eyebrow \{[\s\S]*letter-spacing: 0 !important/);
});

test("P2.3 printed report keeps web-only navigation and sensitive resume actions out of the PDF", () => {
  assert.match(form, /className="skip-link orientation-print-hide"/);
  assert.match(page, /orientation-print-hide[\s\S]*OrientationReportActions/);
  assert.match(page, /orientation-print-hide[\s\S]*href=\{signupHref\}/);
});
