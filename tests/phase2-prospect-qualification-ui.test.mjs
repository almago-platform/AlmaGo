import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/prospect/orientation/page.tsx", "utf8");
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const hub = readFileSync("src/lib/prospect/hub.ts", "utf8");
const summary = readFileSync("src/components/prospect/ProspectQualificationSummary.tsx", "utf8");
const copy = readFileSync("src/content/prospect-qualification-copy.ts", "utf8");

test("P2.7D loads qualification only for the exact current orientation", () => {
  assert.match(hub, /\.select\("id,engine_version,input,result,created_at"\)/);
  assert.match(hub, /if \(current\?\.id\)/);
  assert.match(hub, /from\("prospect_qualifications"\)/);
  assert.match(hub, /\.select\("state,next_action"\)/);
  assert.match(hub, /\.eq\("orientation_id", current\.id\)/);
  assert.match(hub, /\.order\("created_at", \{ ascending: false \}\)/);
  assert.match(hub, /\.limit\(1\)/);
});

test("prospect qualification UI does not expose reviewer or internal override details", () => {
  for (const source of [page, hub, summary]) {
    assert.doesNotMatch(source, /reviewer_user_id|review_reason|supersedes_id/);
    assert.doesNotMatch(source, /reason_codes|missing_fields|verification_requirements/);
  }
  assert.match(hub, /validStoredQualification/);
  assert.match(hub, /prospectQualificationStates/);
  assert.match(hub, /prospectQualificationNextActions/);
  assert.match(page, /ProspectQualificationSummary/);
});

test("qualification UI supports a safe fallback for legacy orientations", () => {
  assert.match(summary, /if \(!qualification\)/);
  assert.match(summary, /copy\.unavailableTitle/);
  assert.match(summary, /copy\.unavailableBody/);
  assert.match(page, /<ProspectQualificationSummary/);
  assert.match(page, /qualification=\{state\.qualification\}/);
  assert.match(page, /copy=\{qualificationCopy\}/);
});

test("qualification copy exists in all supported locales and keeps admission/visa disclaimer", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(copy, new RegExp(`const ${locale}: ProspectQualificationCopy`));
  }
  for (const state of [
    "not_evaluated",
    "too_early",
    "needs_information",
    "needs_verification",
    "ready_for_review",
    "qualified_prospect",
  ]) {
    assert.match(copy, new RegExp(`${state}:`));
  }
  assert.match(copy, /ne constitue ni une admission, ni une décision de visa/);
  assert.match(copy, /لا تمثل قبولًا جامعيًا أو قرار تأشيرة/);
  assert.match(copy, /not an admission or visa decision/);
  assert.match(copy, /weder eine Zulassungs- noch eine Visumentscheidung/);
});

test("P2.7D qualification summary does not itself unlock client access or implement offers", () => {
  assert.doesNotMatch(summary + copy, /client_active|payment_pending|paid_pending_validation/);
  assert.doesNotMatch(summary + copy, /Bronze|Silver|Gold|checkout|payment/i);
  assert.match(dashboard, /payment_pending/);
  assert.match(dashboard, /paid_pending_validation/);
});

test("qualification copy uses student-facing language instead of internal workflow jargon", () => {
  assert.match(copy, /Avancement du projet/);
  assert.match(copy, /Prêt pour la suite/);
  assert.match(copy, /تقدّم المشروع/);
  assert.match(copy, /جاهز للخطوة التالية/);
  assert.match(copy, /Project progress/);
  assert.match(copy, /Ready for the next step/);
  assert.match(copy, /Projektfortschritt/);
  assert.match(copy, /Bereit für den nächsten Schritt/);
  assert.doesNotMatch(copy, /Qualification pas encore calculée|Projet qualifié|étape commerciale suivante|La qualification AlmaGo/);
  assert.doesNotMatch(copy, /حالة تأهيل محفوظة|مشروع مؤهل|المرحلة التجارية التالية|تأهيل AlmaGo/);
  assert.doesNotMatch(copy, /Qualification not calculated yet|Project qualified|next commercial step|AlmaGo qualification/);
  assert.doesNotMatch(copy, /Qualifikation noch nicht berechnet|Projekt qualifiziert|nächste kommerzielle Phase|AlmaGo-Qualifikation/);
});
