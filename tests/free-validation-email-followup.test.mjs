import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const captureRoute = read("src/app/api/orientation/prospect/route.ts");
const interestRoute = read("src/app/api/orientation/interest/route.ts");
const emailTemplate = read("src/lib/orientation/prospect-email.ts");
const confirmPage = read("src/app/orientation/continue/[token]/page.tsx");
const confirmClient = read("src/components/orientation/FreeValidationInterestConfirm.tsx");
const copy = read("src/content/free-validation-interest-copy.ts");

test("FVL-3 only puts the email continue CTA behind explicit contact consent", () => {
  assert.match(
    captureRoute,
    /const interestUrl = contactConsent[\s\S]*?\?[\s\S]*?\/orientation\/continue\//,
  );
  assert.match(captureRoute, /: null;/);
  assert.match(captureRoute, /interestUrl,/);
  assert.match(emailTemplate, /interestUrl\?: string \| null/);
  assert.match(emailTemplate, /interestUrl \?/);
});

test("FVL-3 email copy explains free continuation in every locale", () => {
  assert.match(emailTemplate, /Je veux continuer avec Campus Allemagne/);
  assert.match(emailTemplate, /Aucun paiement n’est demandé/);
  assert.match(emailTemplate, /أريد المتابعة مع Campus Allemagne/);
  assert.match(emailTemplate, /لا يُطلب أي دفع/);
  assert.match(emailTemplate, /I want to continue with Campus Allemagne/);
  assert.match(emailTemplate, /No payment is requested/);
  assert.match(emailTemplate, /Ich möchte mit Campus Allemagne weitermachen/);
  assert.match(emailTemplate, /keine Zahlung verlangt/);
});

test("FVL-3 email confirmation GET is read-only and validates opaque token expiry", () => {
  assert.match(confirmPage, /isPhase2ProspectCaptureEnabled\(\)/);
  assert.match(confirmPage, /hashFreeValidationInterestToken\(token\)/);
  assert.match(confirmPage, /free_validation_interest_token_hash/);
  assert.match(confirmPage, /free_validation_interest_token_expires_at/);
  assert.match(confirmPage, /\.select\("input"\)/);
  assert.doesNotMatch(confirmPage, /\.insert\(|\.update\(|\.delete\(|fetch\(/);
});

test("FVL-3 requires an explicit browser POST after the confirmation page is opened", () => {
  assert.match(confirmClient, /type="button"/);
  assert.match(confirmClient, /onClick=\{confirmInterest\}/);
  assert.match(confirmClient, /method: "POST"/);
  assert.match(confirmClient, /source: "email_followup"/);
  assert.match(confirmClient, /\/api\/orientation\/interest/);
  assert.match(copy, /Seul le bouton ci-dessus confirme votre choix/);
  assert.match(copy, /Simply opening this page records no request/);
});

test("FVL-3 interest API accepts only the two bounded attribution sources", () => {
  assert.match(
    interestRoute,
    /record\.source === "email_followup"[\s\S]*?"email_followup"[\s\S]*?record\.source === undefined \|\| record\.source === "orientation_result"[\s\S]*?"orientation_result"[\s\S]*?: null/,
  );
  assert.match(interestRoute, /source,/);
});

test("FVL-3 confirmation URL exposes no prospect id or email", () => {
  assert.match(captureRoute, /encodeURIComponent\(interest\.token\)/);
  assert.doesNotMatch(captureRoute, /orientation\/continue\/.*email/i);
  assert.doesNotMatch(captureRoute, /orientation\/continue\/.*prospectId/i);
  assert.doesNotMatch(confirmPage, /prospect_id|email/);
});

test("FVL-3 makes no payment, qualification or document-access transition", () => {
  for (const source of [captureRoute, interestRoute, confirmPage, confirmClient]) {
    assert.doesNotMatch(
      source,
      /payment_pending|paid_pending_validation|client_active|qualified_prospect|student-documents|storage\.objects/i,
    );
  }
});

test("FVL-3 confirmation copy contains no admission or visa promise", () => {
  assert.doesNotMatch(
    copy,
    /admission garantie|visa garanti|guaranteed admission|guaranteed visa/i,
  );
  assert.match(copy, /ne constitue ni une admission, ni une garantie de visa/);
});
