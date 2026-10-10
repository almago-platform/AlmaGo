import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import { isPhase2EmailDeliveryEnabled, isOrientationIncludedEmailEnabled } from "../src/lib/phase2/config.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const migration = read("supabase/migrations/0034_phase2_orientation_resume_email.sql");
const token = read("src/lib/orientation/resume-token.ts");
const mailer = read("src/lib/email/transactional.ts");
const emailTemplate = read("src/lib/orientation/prospect-email.ts");
const route = read("src/app/api/orientation/prospect/route.ts");
const report = read("src/app/orientation/report/[token]/page.tsx");
const config = read("src/lib/phase2/config.ts");
const env = read(".env.example");

test("resume tokens are random, hashed and expiring", () => {
  assert.match(token, /randomBytes\(RESUME_TOKEN_BYTES\)/);
  assert.match(token, /RESUME_TOKEN_BYTES = 32/);
  assert.match(token, /createHash\("sha256"\)/);
  assert.match(token, /RESUME_TOKEN_TTL_DAYS = 90/);
  assert.match(migration, /resume_token_hash text/i);
  assert.match(migration, /resume_token_expires_at timestamptz/i);
  assert.doesNotMatch(migration, /resume_token\s+text/i);
  assert.doesNotMatch(migration, /grant\s+.*anon/i);
});

test("transactional email secrets stay server-only and support Resend or the Supabase SMTP provider", () => {
  assert.match(mailer, /import "server-only"/);
  assert.match(mailer, /https:\/\/api\.resend\.com\/emails/);
  assert.match(mailer, /RESEND_API_KEY/);
  assert.match(mailer, /ALMAGO_TRANSACTIONAL_EMAIL_FROM/);
  assert.match(mailer, /"Idempotency-Key": message\.idempotencyKey/);
  assert.match(mailer, /ALMAGO_SMTP_HOST/);
  assert.match(mailer, /ALMAGO_SMTP_PORT/);
  assert.match(mailer, /ALMAGO_SMTP_USERNAME/);
  assert.match(mailer, /ALMAGO_SMTP_PASSWORD/);
  assert.match(mailer, /STARTTLS/);
  assert.match(mailer, /AUTH PLAIN|AUTH LOGIN/);
  assert.match(mailer, /provider: "smtp"/);
  assert.doesNotMatch(mailer, /NEXT_PUBLIC_/);
  assert.doesNotMatch(mailer, /console\.(?:log|error)/);
});

test("email delivery has an independent default-off Phase 2 gate", () => {
  assert.match(config, /isPhase2EmailDeliveryEnabled/);
  assert.match(config, /isPhase2ProspectCaptureEnabled\(env\)/);
  assert.match(config, /ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED/);
  assert.match(env, /ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED=false/);
  assert.match(env, /ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER=smtp/);
  assert.match(env, /ALMAGO_SMTP_HOST=smtp\.example\.com/);
  assert.match(env, /ALMAGO_SMTP_USERNAME=your-smtp-user/);
  assert.match(env, /ALMAGO_SMTP_PASSWORD=your-smtp-password/);
  assert.match(env, /ALMAGO_TRANSACTIONAL_EMAIL_PROVIDER=resend/);
  assert.match(env, /RESEND_API_KEY=re_/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_RESEND|NEXT_PUBLIC_.*EMAIL.*KEY|NEXT_PUBLIC_.*SMTP/i);
});

test("SMTP transport refuses plaintext credentials and builds multipart UTF-8 mail", () => {
  assert.match(mailer, /if \(!capabilities\.toUpperCase\(\)\.includes\("STARTTLS"\)\)/);
  assert.match(mailer, /Content-Type: multipart\/alternative/);
  assert.match(mailer, /Content-Transfer-Encoding: base64/);
  assert.match(mailer, /X-AlmaGo-Idempotency-Key/);
  assert.match(mailer, /Message-ID/);
});

test("prospect persistence succeeds independently from delivery", () => {
  assert.match(route, /resume_token_hash: resume\.hash/);
  assert.match(route, /resume_token_expires_at: resume\.expiresAt/);
  assert.match(route, /select\("id"\)\s*\.single\(\)/);
  assert.match(route, /saved: true, delivery: "disabled"/);
  assert.match(route, /saved: true, delivery: "unavailable"/);
  assert.match(route, /delivery: delivery\.status/);
  assert.match(route, /phase2-orientation\/\$\{orientation\.id\}/);
  assert.doesNotMatch(route, /console\.(?:log|error)/);
  assert.doesNotMatch(route, /auth\.admin|createUser|signUp/);
});

test("resume URLs expose only an opaque token and lookup never uses prospect email or IDs", () => {
  assert.match(route, /\/orientation\/report\/\$\{encodeURIComponent\(resume\.token\)\}/);
  assert.match(route, /document=candidate/);
  assert.match(report, /hashOrientationResumeToken\(token\)/);
  assert.match(report, /\.eq\("resume_token_hash", tokenHash\)/);
  assert.match(report, /\.gt\("resume_token_expires_at", now\)/);
  assert.doesNotMatch(report, /\.eq\("email"|\.ilike\("email"|prospect_id/);
  assert.doesNotMatch(route, /reportUrl.*email|orientation\/report\/.*prospectId/i);
});

test("transactional email is localized and sends both secure PDF report links without guarantees", () => {
  assert.match(emailTemplate, /Record<Locale, EmailCopy>/);
  assert.match(emailTemplate, /orientationReportUrl/);
  assert.match(emailTemplate, /candidateReportUrl/);
  assert.match(emailTemplate, /Orientation \(PDF\)|التوجيه \(PDF\)|Orientierung \(PDF\)/);
  assert.match(emailTemplate, /Rapport candidat \(PDF\)|تقرير المترشح \(PDF\)|Candidate report \(PDF\)|Bewerberbericht \(PDF\)/);
  assert.doesNotMatch(emailTemplate, /signupUrl|accountCta|accountNote/);
  assert.match(emailTemplate, /admission.*visa|قبول.*تأشيرة|Zulassungs.*Visum/i);
  assert.doesNotMatch(emailTemplate, /guaranteed admission|admission garantie|visa garanti/i);
});


test("email delivery can be enabled without forcing account creation", () => {
  const emailOnly = {
    ALMAGO_PARTNER_PRELAUNCH_MODE: "false",
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
    ALMAGO_PHASE2_ACCOUNT_LINKING_ENABLED: "false",
    ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "true",
  };

  assert.equal(isPhase2EmailDeliveryEnabled(emailOnly), true);
  assert.equal(isPhase2EmailDeliveryEnabled({ ...emailOnly, ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "false" }), false);
  assert.equal(isPhase2EmailDeliveryEnabled({ ...emailOnly, ALMAGO_PARTNER_PRELAUNCH_MODE: "true" }), false);
  assert.equal(isPhase2EmailDeliveryEnabled({ ...emailOnly, ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "false" }), false);
  assert.doesNotMatch(emailTemplate, /signupUrl|accountCta|accountNote/);
  assert.match(route, /const signupPath = isPhase2AccountLinkingEnabled\(\)/);
});


test("automatic delivery requires explicit recorded consent and refuses missing PDF attachments", () => {
  assert.match(route, /automaticDelivery = record\.deliveryMode === "automatic"/);
  assert.match(route, /emailDeliveryConsent = record\.emailDeliveryConsent === true/);
  assert.match(route, /automaticDelivery && !emailDeliveryConsent/);
  assert.match(route, /Explicit automatic email consent is required/);
  assert.match(route, /email_delivery_mode: "automatic"/);
  assert.match(route, /email_delivery_consent: true/);
  assert.match(route, /email_delivery_consent_at: new Date\(\)\.toISOString\(\)/);
  assert.match(route, /isAdultPublicOrientationIdentity\(identity\)/);
  assert.match(route, /\(automaticDelivery \|\| includedDelivery\) && attachments\.length < 2/);
  assert.match(route, /saved: true, delivery: "unavailable"/);
  assert.match(route, /sendTransactionalEmail\(\{/);
});

test("emailed PDF reports never include an account sign-up CTA or orientation account token", () => {
  assert.doesNotMatch(emailTemplate, /signupUrl|accountCta|accountNote/);
  assert.doesNotMatch(route, /signupUrl/);
  assert.match(route, /const signupPath = isPhase2AccountLinkingEnabled\(\)/);
  assert.match(route, /resume_token_hash: resume\.hash/);
  assert.match(emailTemplate, /orientationReportUrl/);
  assert.match(emailTemplate, /candidateReportUrl/);
  assert.match(emailTemplate, /attachmentsIncluded/);
  // The account-link token remains available only to the on-site confirmation UI.
  assert.match(route, /signupPath \},/);
});

test("automatic included emails are default-off and never bypass legal rollout, minor, or PDF safety gates", () => {
  const flags = {
    ALMAGO_PARTNER_PRELAUNCH_MODE: "false",
    ALMAGO_PHASE2_ENABLED: "true",
    ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "true",
    ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "true",
    ALMAGO_ORIENTATION_INCLUDED_EMAIL_ENABLED: "true",
  };

  assert.equal(isOrientationIncludedEmailEnabled(flags), true);
  assert.equal(isOrientationIncludedEmailEnabled({ ...flags, ALMAGO_ORIENTATION_INCLUDED_EMAIL_ENABLED: "false" }), false);
  assert.equal(isOrientationIncludedEmailEnabled({ ...flags, ALMAGO_PHASE2_EMAIL_DELIVERY_ENABLED: "false" }), false);
  assert.equal(isOrientationIncludedEmailEnabled({ ...flags, ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED: "false" }), false);
  assert.equal(isOrientationIncludedEmailEnabled({ ...flags, ALMAGO_PARTNER_PRELAUNCH_MODE: "true" }), false);
  assert.match(env, /ALMAGO_ORIENTATION_INCLUDED_EMAIL_ENABLED=false/);
  assert.match(route, /includedDelivery = record\.deliveryMode === "included"/);
  assert.match(route, /emailNoticeShown = record\.emailNoticeShown === true/);
  assert.match(route, /includedDelivery && \(!isOrientationIncludedEmailEnabled\(\) \|\| !emailNoticeShown\)/);
  assert.match(route, /Persistent orientation capture is limited to adults/);
  assert.match(route, /privacy_acknowledged: privacyAcknowledged/);
  assert.match(route, /email_delivery_mode: "included"/);
  assert.match(route, /email_notice_shown: true/);
  assert.match(route, /\(automaticDelivery \|\| includedDelivery\) && attachments\.length < 2/);
  assert.doesNotMatch(emailTemplate, /signupUrl|accountCta|accountNote/);
});
