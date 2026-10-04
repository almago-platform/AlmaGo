import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const pdf = readFileSync("src/lib/orientation/pdf-attachments.ts", "utf8");
const mailer = readFileSync("src/lib/email/transactional.ts", "utf8");
const route = readFileSync("src/app/api/orientation/prospect/route.ts", "utf8");
const copy = readFileSync("src/lib/orientation/prospect-email.ts", "utf8");

test("orientation emails generate two actual PDF attachments server-side", () => {
  assert.match(pdf, /buildOrientationEmailPdfAttachments/);
  assert.match(pdf, /%PDF-1\.4/);
  assert.match(pdf, /\/Type \/Page/);
  assert.match(pdf, /orientation-campus-allemagne\.pdf/);
  assert.match(pdf, /rapport-candidat-campus-allemagne\.pdf/);
  assert.match(pdf, /contentBase64: orientation\.toString\("base64"\)/);
  assert.match(pdf, /contentBase64: candidate\.toString\("base64"\)/);
  assert.match(pdf, /contentType: "application\/pdf"/);
});

test("orientation PDF attachment keeps personalized recommendations when available", () => {
  assert.match(pdf, /OrientationPublicPersonalizedResult/);
  assert.match(pdf, /content\.mainPriority\.title/);
  assert.match(pdf, /content\.studyOptions\.slice\(0, 4\)/);
  assert.match(pdf, /content\.roadmap\.slice\(0, 6\)/);
  assert.match(route, /projectOrientationHumanReviewBundleToPublicResult/);
  assert.match(route, /orientation_human_reviews/);
});

test("Arabic orientation keeps a secure full report link and a readable PDF fallback", () => {
  assert.match(pdf, /locale === "ar" \? "fr" : locale/);
  assert.match(pdf, /La version PDF jointe est générée en français/);
  assert.match(pdf, /input\.personalized && input\.locale !== "ar"/);
});

test("Resend sends generated PDFs as file attachments", () => {
  assert.match(mailer, /attachments\?: readonly TransactionalEmailAttachment\[\]/);
  assert.match(mailer, /attachments: message\.attachments\.map/);
  assert.match(mailer, /content: attachment\.contentBase64/);
  assert.match(mailer, /content_type: attachment\.contentType/);
});

test("SMTP sends the same generated PDFs as multipart attachments", () => {
  assert.match(mailer, /multipart\/mixed/);
  assert.match(mailer, /Content-Disposition: attachment/);
  assert.match(mailer, /Content-Transfer-Encoding: base64/);
  assert.match(mailer, /wrapBase64Content\(attachment\.contentBase64\)/);
});

test("prospect save flow attaches both PDFs and keeps secure report links", () => {
  assert.match(route, /buildOrientationEmailPdfAttachments/);
  assert.match(route, /attachmentsIncluded: attachments\.length === 2/);
  assert.match(route, /attachments,/);
  assert.match(route, /orientationReportUrl/);
  assert.match(route, /candidateReportUrl/);
});

test("transactional copy tells the student when PDFs are attached", () => {
  assert.match(copy, /attachmentsIncluded = false/);
  assert.match(copy, /Les deux rapports sont également joints à cet e-mail au format PDF/);
  assert.match(copy, /Both reports are also attached to this email as PDF files/);
  assert.match(copy, /attachmentsIncluded \? \[copy\.attachmentsNote\] : \[\]/);
});
