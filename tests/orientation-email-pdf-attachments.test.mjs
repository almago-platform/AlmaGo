import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const browser = read("src/lib/orientation/browser-pdf.ts");
const route = read("src/app/api/orientation/prospect/route.ts");
const email = read("src/lib/orientation/prospect-email.ts");
const savedPage = read("src/app/orientation/report/[token]/page.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const consent = read("src/content/orientation-prospect-copy.ts");
const detailed = read("src/components/orientation/OrientationDetailedPrintReport.tsx");
const detailedCss = read("src/components/orientation/OrientationDetailedPrintReport.css");
const mailer = read("src/lib/email/transactional.ts");

test("email attaches the two actual browser-printed website PDFs, never the legacy three", () => {
  assert.match(route, /await buildWebsiteOrientationPdfAttachments\(/);
  assert.doesNotMatch(route, /buildOrientationEmailPdfAttachments|buildDetailedOrientationEmailPdfAttachment/);
  assert.match(route, /if \(attachments\.length !== 2\)/);
  assert.match(route, /attachmentsIncluded: attachments\.length === 2/);
  assert.match(route, /sendTransactionalEmail\(\{/);
  assert.match(route, /attachments,/);
  assert.match(route, /detailedPdfAttached: delivery\.status === "sent" && attachments\.length === 2/);
  assert.doesNotMatch(capture, /Vos trois rapports ont été envoyés/);
});

test("Chromium prints the saved site route with the same print CSS and layout for both attachments", () => {
  assert.match(browser, /Page\.printToPDF/);
  assert.match(browser, /printBackground: true/);
  assert.match(browser, /preferCSSPageSize: true/);
  assert.match(browser, /document\.fonts\.status === "loaded"/);
  assert.match(browser, /data-orientation-report-ready/);
  assert.match(detailed, /data-orientation-report-ready/);
  assert.match(savedPage, /OrientationOnePagePrintReport/);
  assert.match(savedPage, /OrientationDetailedPrintReport/);
  assert.match(browser, /"orientation"\);/);
  assert.match(browser, /hasPersonalizedShortlist \? "detailed" : "candidate"/);
  assert.match(browser, /resume-orientation-campus-allemagne\.pdf/);
  assert.match(browser, /dossier-detaille-campus-allemagne\.pdf/);
  assert.match(browser, /rapport-candidat-campus-allemagne\.pdf/);
});

test("server PDF browser only opens an opaque saved report token via local loopback", () => {
  assert.match(browser, /127\.0\.0\.1:3000/);
  assert.match(browser, /PDF origin must be local loopback/);
  assert.match(browser, /encodeURIComponent\(token\)/);
  assert.match(browser, /Page\.navigate/);
  assert.doesNotMatch(browser, /--print-to-pdf/);
  assert.match(browser, /--remote-debugging-port=0/);
  assert.match(browser, /MAX_PDF_BYTES/);
  assert.match(browser, /child\?\.kill\("SIGKILL"\)/);
  assert.match(browser, /rm\(profile, \{ recursive: true, force: true \}\)/);
  assert.doesNotMatch(browser, /console\.log|console\.error/);
});

test("the documented university images and content stay together in the A4 PDF", () => {
  assert.match(detailedCss, /\.orientation-print-page \.orientation-detailed-print-report \.orientation-detail-research-card/);
  assert.match(detailedCss, /page-break-inside: avoid !important/);
  assert.match(detailed, /localizedTeachingLanguage/);
  assert.match(detailed, /documentedResearchReason/);
  assert.match(detailed, /item\.officialUrl/);
  assert.match(detailed, /findCuratedUniversityMedia/);
});

test("email contains exactly two links and explains exactly two attachments", () => {
  assert.match(email, /detailedReportUrl\s*\?/);
  assert.match(email, /copy\.detailedReportDescription/);
  assert.match(email, /copy\.candidateReportDescription/);
  assert.match(email, /detailedAttachmentIncluded \? copy\.detailedAttachmentsNote : copy\.attachmentsNote/);
  assert.match(consent, /deux PDF identiques aux documents du site/);
  assert.match(consent, /ملفين PDF مطابقين/);
  assert.match(consent, /two PDFs identical to the documents on the site/);
  assert.match(consent, /Website übereinstimmende PDFs/);
  assert.doesNotMatch(email, /\.\.\.\(detailedAttachmentIncluded \?/);
});

test("Resend and SMTP still send bytes without changing delivery consent or token security", () => {
  assert.match(mailer, /attachments: message\.attachments\.map/);
  assert.match(mailer, /content: attachment\.contentBase64/);
  assert.match(mailer, /Content-Disposition: attachment/);
  assert.match(mailer, /wrapBase64Content\(attachment\.contentBase64\)/);
  assert.match(route, /emailDeliveryConsent === true/);
  assert.match(route, /emailNoticeShown === true/);
  assert.match(route, /saved: true, delivery: "unavailable"/);
  assert.doesNotMatch(route, /console\.(?:log|error)/);
});
