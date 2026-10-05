import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0043_phase2_payment_orchestration.sql",
  "utf8",
);
const config = readFileSync("src/lib/phase2/config.ts", "utf8");
const payment = readFileSync("src/lib/phase2/payment.ts", "utf8");
const devAdapter = readFileSync("src/lib/phase2/payment-dev-adapter.ts", "utf8");
const purchaseRoute = readFileSync("src/app/api/phase2/purchases/route.ts", "utf8");
const devRoute = readFileSync("src/app/api/phase2/payments/dev-confirm/route.ts", "utf8");
const adminRoute = readFileSync("src/app/api/admin/payments/activate/route.ts", "utf8");
const manualAdminRoute = readFileSync("src/app/api/admin/payments/manual-confirm/route.ts", "utf8");
const adminPage = readFileSync("src/app/admin/payments/page.tsx", "utf8");
const adminForm = readFileSync("src/components/admin/AdminPaymentActivationForm.tsx", "utf8");
const prospectPage = readFileSync("src/app/prospect/payment/page.tsx", "utf8");
const prospectCopy = readFileSync("src/content/prospect-payment-copy.ts", "utf8");
const prospectShell = readFileSync("src/components/layout/ProspectShell.tsx", "utf8");
const appShell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const adminQuality = readFileSync("tests/e2e/admin-space-quality.spec.mjs", "utf8");
const envExample = readFileSync(".env.example", "utf8");

test("P2.9B creates purchases only from a published immutable offer snapshot", () => {
  assert.match(migration, /create or replace function public\.begin_phase2_commercial_purchase/i);
  assert.match(
    migration,
    /v\.id = p_offer_version_id[\s\S]*v\.status = 'published'::public\.commercial_offer_version_status/i,
  );
  assert.match(migration, /jsonb_build_object\([\s\S]*'offer_version_id'[\s\S]*'price_minor'[\s\S]*'currency'/i);
  assert.match(
    migration,
    /update public\.customer_access[\s\S]*status = 'payment_pending'::public\.customer_lifecycle_status/i,
  );
  assert.match(migration, /source,[\s\S]*purchase_id[\s\S]*'purchase_created'/i);
  assert.match(migration, /commercial_purchases_one_live_per_user_idx/i);
});

test("purchase API derives identity from the authenticated session and never accepts economics", () => {
  assert.match(purchaseRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(purchaseRoute, /from\("user_roles"\)/);
  assert.match(purchaseRoute, /role\?\.role !== "student"/);
  assert.match(purchaseRoute, /offerVersionId/);
  assert.match(purchaseRoute, /createPhase2CommercialPurchase\(\s*user\.id,\s*offerVersionId/);
  assert.doesNotMatch(
    purchaseRoute,
    /record\.(?:amount|amountMinor|price|currency|userId|user_id|status|provider)/,
  );
});

test("payment provider contract is normalized and contains no selected production provider", () => {
  assert.match(payment, /export type PaymentProviderAdapter/);
  assert.match(payment, /startPayment\(input: PaymentProviderStartInput\)/);
  assert.match(payment, /normalizeEvent/);
  for (const type of [
    "charge_succeeded",
    "charge_failed",
    "payment_cancelled",
    "refund_succeeded",
    "dispute_opened",
  ]) {
    assert.match(payment, new RegExp(type));
    assert.match(migration, new RegExp(type));
  }
  assert.doesNotMatch(payment + migration, /stripe|paypal|adyen|mollie/i);
});

test("normalized provider events are server-owned, deduplicated and reject context mismatches", () => {
  assert.match(migration, /payment_provider_events[\s\S]*provider_event_id/i);
  assert.match(migration, /v_existing_hash <> p_payload_sha256/i);
  assert.match(migration, /v_attempt_provider <> v_provider/i);
  assert.match(migration, /v_purchase_amount <> p_amount_minor/i);
  assert.match(migration, /v_purchase_currency <> v_currency/i);
  assert.match(migration, /transaction_context_mismatch/i);
  assert.match(migration, /invalid_charge_transition/i);
  assert.match(payment, /process_phase2_normalized_payment_event/);
  assert.match(payment, /hashPaymentPayload/);
  assert.doesNotMatch(migration, /raw_payload|card_number|cvc|cvv/i);
});

test("successful charge requires admin validation before client_active", () => {
  assert.match(
    migration,
    /charge_succeeded[\s\S]*paid_pending_validation'::public\.commercial_purchase_status/i,
  );
  assert.match(
    migration,
    /paid_pending_validation'::public\.customer_lifecycle_status[\s\S]*payment_charge_confirmed/i,
  );
  assert.match(migration, /create or replace function public\.activate_phase2_paid_purchase/i);
  assert.match(
    migration,
    /t\.kind = 'charge'::public\.payment_transaction_kind[\s\S]*t\.status = 'succeeded'/i,
  );
  assert.match(
    migration,
    /status = 'client_active'::public\.customer_lifecycle_status/i,
  );
  assert.match(migration, /'admin_payment_validation'/i);
});

test("cancel refund and dispute revoke paid access through audited transitions", () => {
  assert.match(
    migration,
    /payment_cancelled[\s\S]*status = 'qualified_prospect'::public\.customer_lifecycle_status/i,
  );
  assert.match(
    migration,
    /refund_succeeded[\s\S]*'refund'::public\.payment_transaction_kind/i,
  );
  assert.match(
    migration,
    /dispute_opened[\s\S]*'dispute'::public\.payment_transaction_kind/i,
  );
  assert.match(migration, /'payment_refund'/i);
  assert.match(migration, /'payment_dispute'/i);
  assert.match(
    migration,
    /v_target_access_status := 'qualified_prospect'::public\.customer_lifecycle_status/i,
  );
});

test("browser and service-role direct writes are replaced by service-only state-machine RPCs", () => {
  for (const table of [
    "commercial_purchases",
    "payment_attempts",
    "payment_transactions",
    "payment_provider_events",
    "customer_access_events",
  ]) {
    assert.match(
      migration,
      new RegExp(
        `revoke insert, update, delete, truncate[\\s\\S]*public\\.${table}[\\s\\S]*from service_role`,
        "i",
      ),
    );
  }

  for (const fn of [
    "begin_phase2_commercial_purchase",
    "begin_phase2_payment_attempt",
    "bind_phase2_payment_attempt_session",
    "process_phase2_normalized_payment_event",
    "activate_phase2_paid_purchase",
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke execute on function public\\.${fn}[\\s\\S]*from public, anon, authenticated`, "i"),
    );
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${fn}[\\s\\S]*to service_role`, "i"),
    );
  }
});

test("development payment confirmation is impossible in production and default-off", () => {
  assert.match(config, /isPhase2DevPaymentAdapterEnabled/);
  assert.match(config, /env\.NODE_ENV === "production"/);
  assert.match(config, /isPhase2PaymentOrchestrationEnabled/);
  assert.match(envExample, /ALMAGO_PHASE2_PAYMENT_ORCHESTRATION_ENABLED=false/);
  assert.match(envExample, /ALMAGO_PHASE2_DEV_PAYMENT_ADAPTER_ENABLED=false/);
  assert.match(devRoute, /isPhase2DevPaymentAdapterEnabled\(\)/);
  assert.match(devAdapter, /DEV_PROVIDER = "almago_dev"/);
  assert.match(devAdapter, /getPurchasePaymentContext\(userId, purchaseId\)/);
  assert.match(devAdapter, /processNormalizedPaymentEvent/);
  assert.doesNotMatch(devRoute, /amountMinor|currency|providerTransactionId/);
});

test("admin manual payment confirmation is authenticated, server-priced and audited", () => {
  assert.match(manualAdminRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(manualAdminRoute, /role\?\.role !== "admin"/);
  assert.match(
    manualAdminRoute,
    /recordManualPhase2Payment\(\s*user\.id,\s*purchaseId,\s*reference/,
  );
  assert.doesNotMatch(
    manualAdminRoute,
    /record\.(?:adminId|userId|user_id|status|amount|amountMinor|currency)/,
  );

  assert.match(payment, /MANUAL_PAYMENT_PROVIDER = "manual_admin"/);
  assert.match(payment, /from\("commercial_purchases"\)/);
  assert.match(payment, /purchase\.status !== "payment_pending"/);
  assert.match(payment, /beginPhase2PaymentAttempt/);
  assert.match(payment, /bindPhase2PaymentAttemptSession/);
  assert.match(payment, /type: "charge_succeeded"/);
  assert.match(payment, /providerTransactionId: `manual-charge-\$\{purchaseId\}`/);
  assert.match(payment, /status === "paid_pending_validation"/);
});

test("admin activation derives admin identity and payment page exposes the two-step manual flow", () => {
  assert.match(adminRoute, /supabase\.auth\.getUser\(\)/);
  assert.match(adminRoute, /role\?\.role !== "admin"/);
  assert.match(adminRoute, /activatePhase2PaidPurchase\(user\.id, purchaseId\)/);
  assert.doesNotMatch(adminRoute, /record\.(?:adminId|userId|user_id|status|amount|currency)/);
  assert.match(adminPage, /purchase\.status === "payment_pending"/);
  assert.match(adminPage, /purchase\.status === "paid_pending_validation"/);
  assert.match(adminPage, /status=\{purchase\.status\}/);
  assert.match(adminForm, /fetch\(endpoint/);
  assert.match(adminForm, /"\/api\/admin\/payments\/manual-confirm"/);
  assert.match(adminForm, /"\/api\/admin\/payments\/activate"/);
  assert.match(adminForm, /Confirmer le paiement reçu/);
  assert.match(adminForm, /Valider et activer le client/);
});

test("prospect payment summary is read-only, localized and owner-scoped", () => {
  assert.match(prospectPage, /from\("commercial_purchases"\)/);
  assert.match(prospectPage, /\.eq\("user_id", access\.user\.id\)/);
  assert.match(prospectPage, /from\("payment_attempts"\)/);
  assert.match(prospectPage, /from\("payment_transactions"\)/);
  assert.doesNotMatch(prospectPage, /insert\(|update\(|delete\(|fetch\(/);
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(prospectCopy, new RegExp(`const ${locale}: ProspectPaymentCopy`));
  }
  assert.match(prospectCopy, /espace Étudiant ne peut être activé qu’après confirmation du paiement/);
  assert.match(prospectCopy, /لا يتم تفعيل مساحة الطالب إلا بعد تأكيد الدفع/);
  assert.match(prospectCopy, /Student access can be activated only after payment confirmation/);
  assert.match(prospectCopy, /Studierendenbereich wird erst nach Zahlungsbestätigung/);
});

test("payment surfaces are present in prospect/admin navigation and admin accessibility matrix", () => {
  assert.match(prospectShell, /href: "\/prospect\/payment"/);
  assert.match(appShell, /href: "\/admin\/payments"/);
  assert.match(adminQuality, /path: "\/admin\/payments", name: "payments"/);
  assert.match(adminQuality, /new AxeBuilder\(\{ page \}\)\.analyze\(\)/);
});
