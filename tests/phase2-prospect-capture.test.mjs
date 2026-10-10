import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const privileged = read("src/lib/supabase/privileged.ts");
const route = read("src/app/api/orientation/prospect/route.ts");
const form = read("src/components/orientation/PublicOrientationForm.tsx");
const capture = read("src/components/orientation/ProspectCaptureCard.tsx");
const config = read("src/lib/phase2/config.ts");
const publicOrientation = read("src/lib/orientation/public.ts");
const prospectCopy = read("src/content/orientation-prospect-copy.ts");
const env = read(".env.example");
const css = read("src/app/globals.css");
const reportActions = read("src/components/orientation/OrientationReportActions.tsx");

test("privileged Supabase access is isolated to a server-only client", () => {
  assert.match(privileged, /import "server-only"/);
  assert.match(privileged, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(privileged, /NEXT_PUBLIC_SUPABASE_SECRET|SERVICE_ROLE/i);
  assert.match(privileged, /persistSession:\s*false/);
  assert.doesNotMatch(capture, /SUPABASE_SECRET|service_role/i);
});

test("prospect capture remains independently feature-gated", () => {
  assert.match(config, /isPhase2ProspectCaptureEnabled/);
  assert.match(config, /ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED/);
  assert.match(env, /ALMAGO_PHASE2_PROSPECT_CAPTURE_ENABLED=false/);
  assert.match(env, /SUPABASE_SECRET_KEY=sb_secret_/);
});

test("persistent Free Validation capture is restricted to adults", () => {
  assert.match(publicOrientation, /isAdultPublicOrientationIdentity/);
  assert.match(route, /isAdultPublicOrientationIdentity\(identity\)/);
  assert.match(route, /Persistent orientation capture is limited to adults/);
  assert.match(route, /status:\s*403/);
  assert.match(capture, /isAdultPublicOrientationIdentity/);
  assert.match(capture, /ageRestrictionTitle/);
  assert.match(prospectCopy, /Sauvegarde réservée aux 18 ans et plus/);
  assert.match(prospectCopy, /18 عامًا أو أكثر/);
});

test("public prospect API validates and recomputes the diagnostic server-side", () => {
  assert.match(route, /MAX_BODY_BYTES = 24_000/);
  assert.match(route, /validEmail/);
  assert.match(route, /validatePublicOrientationAnswers/);
  assert.match(route, /privacyAcknowledged === true/);
  assert.match(route, /buildPublicOrientationDiagnostic\(answers\)/);
  assert.match(route, /ENGINE_VERSION = "public-orientation-v1"/);
  assert.match(route, /createPrivilegedSupabaseClient/);
  assert.match(route, /from\("prospects"\)/);
  assert.match(route, /from\("orientations"\)/);
  assert.doesNotMatch(route, /console\.(?:log|error)|email.*console/i);
});

test("prospect capture creates no Auth user and keeps direct anon table access closed", () => {
  assert.doesNotMatch(route, /auth\.admin|createUser|signUp/);
  assert.doesNotMatch(route, /grant|policy|service_role/i);
});

test("orientation report can be saved through the browser print-to-PDF path", () => {
  assert.match(form, /printOrientationDocument\("summary"\)/);
  assert.match(reportActions, /window\.print\(\)/);
  assert.match(reportActions, /data-orientation-print-mode/);
  assert.match(form, /orientation-print-report/);
  assert.match(css, /@media print/);
  assert.match(css, /orientation-print-hide/);
});

test("required identity is collected before orientation while persistence remains explicit", () => {
  assert.match(form, /name="firstName"/);
  assert.match(form, /name="lastName"/);
  assert.match(form, /name="birthDate"/);
  assert.match(form, /name="email"/);
  assert.match(form, /identityComplete/);
  assert.match(form, /prospectCaptureEnabled\s*\?\s*\([\s\S]*<ProspectCaptureCard/);
  assert.match(capture, /initialEmail/);
  assert.match(capture, /identity/);
  assert.match(capture, /privacyAcknowledged/);
  assert.match(capture, /\/legal\/privacy/);
  assert.match(capture, /fetch\("\/api\/orientation\/prospect"/);
  assert.match(route, /restorePublicOrientationIdentity/);
  assert.match(route, /isCompletePublicOrientationIdentity/);
  assert.match(route, /\.\.\.\(identity \? \{ identity \} : \{\}\)/);
});

test("public post-orientation save, PDF and account actions stay hidden until the engine result is ready", () => {
  assert.match(form, /orientationResultReady/);
  assert.match(form, /onResultReady=\{handleResultReady\}/);
  assert.match(form, /\{!authenticatedUpdate && orientationResultReady \? \([\s\S]*<ProspectCaptureCard/);
  assert.match(form, /\{!authenticatedUpdate && orientationResultReady \? \([\s\S]*printOrientationDocument\("summary"\)/);
  assert.match(form, /disabled=\{!detailedPrintReady\}/);
});

test("continuation card uses one required privacy checkbox and a clear ready state", () => {
  assert.match(capture, /copy\.continueReady/);
  assert.match(capture, /copy\.continuePrivacyLabel/);
  assert.match(capture, /name="privacyAcknowledged"/);
  assert.doesNotMatch(capture, /name="contactConsent"/);
  assert.match(capture, /contactConsent: false/);
});

test("orientation continuation saves the result before opening secure account signup", () => {
  assert.match(
    form,
    /authenticatedUpdate \? \([\s\S]*<ProspectOrientationUpdateCard[\s\S]*\) : \([\s\S]*<PersonalizedOrientationEngineCard/,
  );
  assert.match(form, /accountLinkingEnabled=\{accountLinkingEnabled\}/);
  assert.match(capture, /accountLinkingEnabled/);
  assert.match(capture, /copy\.continueSubmit/);
  assert.match(capture, /payload\.signupPath/);
  assert.match(capture, /window\.location\.assign\(verifiedSignupPath\)/);
  assert.match(capture, /!emailDeliveryEnabled && verifiedSignupPath/);
  assert.match(route, /isPhase2AccountLinkingEnabled/);
  assert.match(route, /\/signup\?orientation_token=/);
  assert.match(route, /signupPath/);
});

test("prospect email capture is mobile-friendly and accessibly validates without enabling the feature", () => {
  assert.match(capture, /noValidate aria-busy=\{status === "saving"\}/);
  assert.match(capture, /name="email"/);
  assert.match(capture, /inputMode="email"/);
  assert.match(capture, /autoCapitalize="none"/);
  assert.match(capture, /spellCheck=\{false\}/);
  assert.match(capture, /required/);
  assert.match(capture, /aria-invalid=\{status === "error" && message === copy\.invalidEmail\}/);
  assert.match(capture, /aria-describedby=\{message \? "orientation-capture-message" : undefined\}/);
  assert.match(capture, /id="orientation-capture-message"/);
  assert.match(capture, /name="privacyAcknowledged"/);
  assert.match(capture, /rel="noopener noreferrer"/);
});


test("transactional email is the primary post-orientation action and account creation stays optional", () => {
  assert.match(capture, /const submitLabel = emailDeliveryEnabled/);
  assert.match(capture, /copy\.emailTitle/);
  assert.match(capture, /copy\.emailPrivacyLabel/);
  assert.match(capture, /setSignupPath\(verifiedSignupPath\)/);
  assert.match(capture, /status === "success" && interestToken/);
  assert.match(prospectCopy, /Recevoir mes deux rapports par e-mail/);
  assert.match(prospectCopy, /Aucun compte n’est nécessaire/);
  assert.match(route, /const signupPath = isPhase2AccountLinkingEnabled\(\)/);
  assert.doesNotMatch(route, /signupUrl/);
});


test("automatic email is optional before orientation and does not survive session hydration", () => {
  assert.match(form, /name="automaticEmailConsent"/);
  assert.match(form, /checked=\{automaticEmailConsent\}/);
  assert.match(form, /setAutomaticEmailConsent\(event\.target\.checked\)/);
  assert.match(form, /useState\(false\)/);
  assert.match(form, /isAdultPublicOrientationIdentity\(identity\)/);
  assert.match(form, /emailDeliveryEnabled && isAdultPublicOrientationIdentity\(identity\)/);
  assert.match(form, /automaticEmailConsent=\{automaticEmailConsent && !includedEmailDeliveryEnabled && isAdultPublicOrientationIdentity\(identity\)\}/);
  assert.match(form, /claimAutoEmailAttempt=\{claimAutoEmailAttempt\}/);
  assert.match(form, /setAutomaticEmailConsent\(false\)/);
  assert.doesNotMatch(form, /JSON\.stringify\(\{ identity, identityComplete, answers, step, automaticEmailConsent/);
  assert.match(prospectCopy, /Oui, je souhaite recevoir automatiquement mes deux rapports PDF/);
  assert.match(prospectCopy, /automaticEmailMinorNotice/);
});

test("auto-email triggers once after the result is ready, with a strict adult guard and no second click", () => {
  assert.match(form, /!authenticatedUpdate && orientationResultReady[\s\S]*<ProspectCaptureCard/);
  assert.match(capture, /const autoStarted = useRef\(false\)/);
  assert.match(capture, /const submitting = useRef\(false\)/);
  assert.match(capture, /if \(!autoEmailRequested \|\| autoStarted\.current\) return/);
  assert.match(capture, /claimAutoEmailAttempt\?\.\(\)/);
  assert.match(capture, /void submit\(undefined, true\)/);
  assert.match(capture, /deliveryMode: "automatic", emailDeliveryConsent: true/);
  assert.match(capture, /if \(automated && !autoEmailRequested\) return/);
  assert.match(capture, /privacyAcknowledged: automated && includedEmailDelivery \? false : true/);
  assert.match(capture, /contactConsent: false/);
  assert.match(capture, /automaticEmailRetry/);
});

test("saved orientation combines account creation and explicit interest in a single CTA", () => {
  assert.match(capture, /interestStatus === "success" && !signupPath/);
  assert.match(capture, /if \(signupPath\) window\.location\.assign\(signupPath\)/);
  assert.match(capture, /status === "success" && interestToken/);
  assert.match(capture, /onClick=\{submitInterest\}/);
  assert.match(capture, /copy\.continueTitle/);
  assert.match(capture, /copy\.continueText/);
  assert.match(prospectCopy, /Votre orientation est sauvegardée/);
  assert.match(route, /resume_token_hash: resume\.hash/);
  assert.match(route, /signupPath/);
});

test("included email mode shows a clear advance notice, with no additional email checkbox or submit button after the result", () => {
  const page = read("src/app/orientation/page.tsx");
  assert.match(page, /isOrientationIncludedEmailEnabled/);
  assert.match(form, /includedEmailDeliveryEnabled/);
  assert.match(form, /prospectCopy\.capture\.includedEmailNotice/);
  assert.match(form, /href="\/legal\/privacy"/);
  assert.match(form, /includedEmailDelivery=\{includedEmailDeliveryEnabled && isAdultPublicOrientationIdentity\(identity\)\}/);
  assert.match(capture, /const autoEmailRequested = \(includedEmailDelivery \|\| automaticEmailConsent\) && emailDeliveryEnabled && persistentCaptureAllowed/);
  assert.match(capture, /autoEmailRequested \? \(/);
  assert.match(capture, /deliveryMode: "included", emailNoticeShown: true/);
  assert.match(capture, /privacyAcknowledged: automated && includedEmailDelivery \? false : true/);
  assert.match(capture, /void submit\(undefined, true\)/);
  assert.match(prospectCopy, /Les deux rapports sont envoyés automatiquement/);
  assert.match(prospectCopy, /includedEmailMinorNotice|automaticEmailMinorNotice/);
  assert.match(route, /isAdultPublicOrientationIdentity\(identity\)/);
});
