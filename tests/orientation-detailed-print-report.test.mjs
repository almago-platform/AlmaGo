import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const detailed = readFileSync("src/components/orientation/OrientationDetailedPrintReport.tsx", "utf8");
const detailedCss = readFileSync("src/components/orientation/OrientationDetailedPrintReport.css", "utf8");
const onePage = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const reportPage = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");
const actions = readFileSync("src/components/orientation/OrientationReportActions.tsx", "utf8");

test("detailed PDF uses the exact personalized shortlisted programmes instead of a hardcoded university", () => {
  assert.match(detailed, /personalized\.selected/);
  assert.match(detailed, /selected\.map\(/);
  assert.match(detailed, /option\.programme/);
  assert.match(detailed, /option\.institution/);
  assert.match(detailed, /option\.city/);
  assert.match(detailed, /content\.studyOptions\.find/);
  assert.doesNotMatch(detailed, /["'](?:Bamberg|Erlangen|Regensburg)["']/);
});

test("only Creative Commons metadata-backed real university photos can appear in the dossier", () => {
  assert.match(detailed, /licensedPhoto\(option\.universityMedia\)/);
  assert.match(detailed, /findCuratedUniversityMedia/);
  assert.match(detailed, /coverImageSourceUrl/);
  assert.match(detailed, /coverImageAttribution/);
  assert.match(detailed, /coverImageLicense/);
  assert.match(detailed, /CC BY/);
  assert.match(detailed, /missingPhoto/);
  assert.match(detailed, /loading="eager"/);
});

test("programme statuses, verified facts and evidence links are preserved and no admission probability is invented", () => {
  assert.match(detailed, /option\.overallStatus === "verified"/);
  assert.match(detailed, /option\.facts\.filter\(\(fact\) => fact\.status === "verified"\)/);
  assert.match(detailed, /fact\.sourceUrl/);
  assert.match(detailed, /safeSource/);
  assert.match(detailed, /première estimation campus allemagne/);
  assert.match(detailed, /admissions/);
});

test("the candidate priority and the continuation link are shared with the one-page report", () => {
  assert.match(detailed, /orientationCandidatePriority\(answers, locale\)/);
  assert.match(onePage, /orientationCandidatePriority\(answers, locale\)/);
  assert.match(detailed, /priority\?\.title \|\| content\.mainPriority\.title/);
  assert.match(detailed, /priority\?\.yourStep \|\| content\.mainPriority\.nextStep/);
  assert.match(detailed, /https:\/\/campusallemagne\.tn\/orientation/);
});

test("the detailed print mode does not change the default A4 one-page print mode", () => {
  assert.match(actions, /mode: OrientationPrintMode = "summary"/);
  assert.match(actions, /data-orientation-print-mode/);
  assert.match(actions, /afterprint/);
  assert.match(detailedCss, /html\[data-orientation-print-mode="detailed"\] \.orientation-print-page \.orientation-one-page-print/);
  assert.match(detailedCss, /orientation-detail-cover \{[\s\S]*break-after: page/);
  assert.match(detailedCss, /break-inside: avoid !important/);
  assert.match(form, /printOrientationDocument\("summary"\)/);
  assert.match(form, /printOrientationDocument\("detailed"\)/);
  assert.match(form, /personalizedForPrint\?\.selected\.length/);
});

test("saved token route only offers the detailed document when a personalized shortlist exists", () => {
  assert.match(reportPage, /query\.document === "detailed"/);
  assert.match(reportPage, /documentMode === "detailed" && !personalized\?\.selected\.length/);
  assert.match(reportPage, /<OrientationDetailedPrintReport/);
  assert.match(reportPage, /\?document=detailed/);
  assert.match(reportPage, /orientation_human_reviews/);
});
