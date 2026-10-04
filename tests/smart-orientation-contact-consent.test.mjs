import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/0045_smart_orientation_contact_consent.sql");
const route = read("src/app/api/orientation/prospect/route.ts");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const copy = read("src/content/orientation-prospect-copy.ts");

test("SO-3 stores contact consent separately with a safe default", () => {
  assert.match(migration, /contact_consent boolean not null default false/);
  assert.match(migration, /contact_consent_at timestamptz/);
  assert.match(migration, /contact_consent_version text/);
  assert.match(migration, /prospects_contact_consent_consistency/);
  assert.match(migration, /where contact_consent = true/);
});

test("SO-3 does not change anon/authenticated write permissions", () => {
  assert.match(migration, /RLS and grants stay unchanged/);
  assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete).*\b(?:anon|authenticated)\b/i);
  assert.doesNotMatch(migration, /create policy/i);
});

test("continuation uses one required privacy choice and does not solicit contact consent at this step", () => {
  assert.match(capture, /name="privacyAcknowledged"[\s\S]*?required/);
  assert.doesNotMatch(capture, /name="contactConsent"/);
  assert.doesNotMatch(capture, /setContactConsent|checked=\{contactConsent\}/);
  assert.match(capture, /contactConsent: false/);
});

test("SO-3 uses a versioned server-side consent marker", () => {
  assert.match(route, /CONTACT_CONSENT_VERSION = "smart-orientation-contact-v1"/);
  assert.match(route, /contactConsent = record\.contactConsent === true/);
  assert.match(route, /contact_consent_at: new Date\(\)\.toISOString\(\)/);
  assert.match(route, /contact_consent_version: CONTACT_CONSENT_VERSION/);
});

test("not checking the box never revokes an existing consent implicitly", () => {
  assert.match(route, /const contactConsentWrite = contactConsent[\s\S]*?\? \{[\s\S]*?contact_consent: true[\s\S]*?: \{\}/);
  assert.match(route, /updated_at: new Date\(\)\.toISOString\(\),[\s\S]*?\.\.\.contactConsentWrite/);
  assert.doesNotMatch(route, /contact_consent:\s*false/);
});

test("each orientation records whether contact consent was given for that submission", () => {
  assert.match(route, /contact_consent: contactConsent/);
  assert.match(
    route,
    /contact_consent_version: contactConsent \? CONTACT_CONSENT_VERSION : null/,
  );
});

test("SO-3 keeps contact consent out of the continuation step while privacy copy stays explicit", () => {
  assert.match(copy, /J’ai lu l’information de confidentialité et j’accepte la sauvegarde de cette orientation pour continuer mon parcours/);
  assert.match(copy, /قرأت معلومات الخصوصية وأوافق على حفظ هذا التوجيه لمواصلة مساري/);
  assert.match(copy, /I have read the privacy information and agree to save this orientation so I can continue my journey/);
  assert.match(copy, /Ich habe die Datenschutzhinweise gelesen und stimme der Speicherung dieser Orientierung zu/);
  assert.doesNotMatch(copy, /J’accepte que Campus Allemagne me contacte au sujet de mon projet d’études/);
});

test("SO-3 adds no automatic marketing or outreach sender", () => {
  assert.doesNotMatch(route, /sendMarketing|sendCampaign|sendOutreach|marketingEmail/i);
  assert.equal((route.match(/sendTransactionalEmail\(/g) ?? []).length, 1);
});
