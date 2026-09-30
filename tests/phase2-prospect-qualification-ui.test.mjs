import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/prospect/page.tsx", "utf8");
const copy = readFileSync("src/content/prospect-qualification-copy.ts", "utf8");

test("P2.7D loads qualification only for the exact current orientation", () => {
  assert.match(page, /\.select\("id,engine_version,input,result,created_at"\)/);
  assert.match(page, /if \(current\?\.id\)/);
  assert.match(page, /from\("prospect_qualifications"\)/);
  assert.match(page, /\.select\("state,next_action"\)/);
  assert.match(page, /\.eq\("orientation_id", current\.id\)/);
  assert.match(page, /\.order\("created_at", \{ ascending: false \}\)/);
  assert.match(page, /\.limit\(1\)/);
});

test("prospect qualification UI does not expose reviewer or internal override details", () => {
  assert.doesNotMatch(page, /reviewer_user_id|review_reason|supersedes_id/);
  assert.doesNotMatch(page, /reason_codes|missing_fields|verification_requirements/);
  assert.match(page, /validStoredQualification/);
  assert.match(page, /prospectQualificationStates/);
  assert.match(page, /prospectQualificationNextActions/);
});

test("qualification UI supports a safe fallback for legacy orientations", () => {
  assert.match(page, /if \(!qualification\)/);
  assert.match(page, /copy\.unavailableTitle/);
  assert.match(page, /copy\.unavailableBody/);
  assert.match(page, /<QualificationPanel qualification=\{qualification\} copy=\{qualificationCopy\}/);
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
  assert.match(copy, /لا يمثل قبولًا جامعيًا أو قرار تأشيرة/);
  assert.match(copy, /not an admission or visa decision/);
  assert.match(copy, /weder eine Zulassungs- noch eine Visumentscheidung/);
});

test("P2.7D does not unlock Phase 1 or implement offers", () => {
  assert.doesNotMatch(page, /client_active|payment_pending|paid_pending_validation/);
  assert.doesNotMatch(page, /Bronze|Silver|Gold|checkout|payment/i);
});
