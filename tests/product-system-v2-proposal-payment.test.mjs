import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const proposalPage = read("src/app/prospect/proposal/page.tsx");
const proposalDecision = read("src/components/prospect/ProposalDecisionPanel.tsx");
const proposalSummary = read("src/components/product/ProposalSummary.tsx");
const intakeCard = read("src/components/prospect/IntakeFlowCard.tsx");
const paymentPage = read("src/app/prospect/payment/page.tsx");
const paymentCopy = read("src/content/prospect-payment-copy.ts");

test("proposal V2 uses the shared Product System summary and explicit Student boundary", () => {
  assert.ok(proposalDecision.includes("ProposalSummary"));
  assert.ok(proposalDecision.includes("Student access stays locked until payment"));
  assert.ok(proposalDecision.includes("Votre espace Étudiant reste verrouillé"));
  assert.ok(proposalSummary.includes("paymentNote"));
  assert.ok(proposalSummary.includes("includedLabel"));
  assert.ok(proposalSummary.includes("totalLabel"));
  assert.ok(intakeCard.includes("ProposalDecisionPanel"));
});

test("proposal acceptance respects the server payment feature flag", () => {
  assert.ok(proposalPage.includes("isPhase2PaymentOrchestrationEnabled"));
  assert.ok(proposalPage.includes("paymentEnabled={paymentEnabled}"));
  assert.ok(proposalDecision.includes("if (!paymentEnabled || busyAction) return"));
  assert.ok(proposalDecision.includes("Paiement temporairement indisponible"));
  assert.ok(proposalDecision.includes("acceptance is disabled until payment orchestration is enabled"));
});

test("proposal V2 keeps acceptance and discussion on the existing APIs", () => {
  assert.ok(proposalDecision.includes('fetch("/api/intake/route/confirm"'));
  assert.ok(proposalDecision.includes('fetch("/api/intake/route/discuss"'));
  assert.ok(proposalDecision.includes('router.push("/prospect/payment")'));
});

test("payment V2 is lifecycle-first and read-only", () => {
  for (const primitive of [
    "DossierHeader",
    "JourneyRail",
    "NextActionPanel",
    "ResponsibilityStrip",
    "DataList",
    "ActivityTimeline",
  ]) {
    assert.ok(paymentPage.includes(primitive));
  }

  assert.ok(paymentPage.includes('from("commercial_purchases")'));
  assert.ok(paymentPage.includes('from("payment_attempts")'));
  assert.ok(paymentPage.includes('from("payment_transactions")'));
  assert.ok(!paymentPage.includes("fetch("));
  assert.ok(!paymentPage.includes(".insert("));
  assert.ok(!paymentPage.includes(".update("));
  assert.ok(!paymentPage.includes(".delete("));
});

test("payment V2 never treats a browser return as Student activation", () => {
  assert.ok(paymentCopy.includes("Un retour navigateur"));
  assert.ok(paymentCopy.includes("Student access can be activated only after payment confirmation"));
  assert.ok(paymentCopy.includes("مساحة الطالب"));
  assert.ok(paymentCopy.includes("Studierendenbereich"));
  assert.ok(!paymentCopy.includes("espace client"));
  assert.ok(!paymentCopy.includes("client access"));
  assert.ok(!paymentCopy.includes("Kundenzugang"));
});

test("payment V2 exposes the exact activation sequence", () => {
  for (const label of [
    "Proposition",
    "Paiement",
    "Validation Campus",
    "Étudiant",
  ]) {
    assert.ok(paymentCopy.includes(label));
  }
  assert.ok(paymentPage.includes('latest.status === "payment_pending"'));
  assert.ok(paymentPage.includes('latest.status === "paid_pending_validation"'));
  assert.ok(paymentPage.includes('latest.status === "client_active"'));
  assert.ok(paymentPage.includes("isPhase2PaymentOrchestrationEnabled"));
});
