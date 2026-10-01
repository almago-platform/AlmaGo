import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/admin/partner-demo/page.tsx", "utf8");
const sandbox = readFileSync("src/components/admin/PartnerPaymentSandbox.tsx", "utf8");
const adminLayout = readFileSync("src/app/admin/layout.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const rehearsal = readFileSync(
  ".github/workflows/almago-partner-ready-rehearsal.yml",
  "utf8",
);
const e2e = readFileSync("tests/e2e/partner-demo.spec.mjs", "utf8");

test("partner demo page is available only behind Partner-Ready mode", () => {
  assert.match(page, /isPartnerPrelaunchModeEnabled\(\)/);
  assert.match(page, /notFound\(\)/);
  assert.match(adminLayout, /partnerPrelaunch=\{isPartnerPrelaunchModeEnabled\(\)\}/);
  assert.match(shell, /partnerPrelaunch \?/);
  assert.match(shell, /href: "\/admin\/partner-demo"/);
});

test("email demo renders only synthetic previews and cannot send externally", () => {
  assert.match(page, /partner-demo\.invalid\/orientation\/report\/demo-token/);
  assert.match(page, /partner-demo\.invalid\/signup\?orientation_token=demo-token/);
  assert.match(page, /sandbox=""/);
  assert.match(page, /Aperçu local uniquement — aucun envoi/);
  assert.doesNotMatch(page, /sendTransactionalEmail|RESEND_API_KEY|fetch\(/);
});

test("payment sandbox is zero-money UI only with no network or database writes", () => {
  assert.match(sandbox, /data-partner-payment-sandbox="true"/);
  assert.match(sandbox, /SANDBOX · 0 €/);
  for (const state of [
    "offer_selected",
    "payment_pending",
    "paid_pending_validation",
    "client_active",
    "refunded",
  ]) {
    assert.match(sandbox, new RegExp(state));
  }
  assert.doesNotMatch(sandbox, /fetch\(|createClient|supabase|commercial_purchases|customer_access/);
  assert.match(page, /aucune modification de <code>customer_access<\/code>/);
});

test("Partner-Ready rehearsal exercises the sandbox on desktop and mobile", () => {
  assert.match(rehearsal, /tests\/e2e\/partner-demo\.spec\.mjs/);
  assert.match(rehearsal, /--project=desktop-chromium --project=mobile-360-chromium/);
  assert.match(e2e, /Simuler un paiement réussi/);
  assert.match(e2e, /Simuler la validation admin/);
  assert.match(e2e, /Simuler un remboursement/);
  assert.match(e2e, /new AxeBuilder/);
});
