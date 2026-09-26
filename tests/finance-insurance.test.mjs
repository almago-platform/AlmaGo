import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  financeInsuranceKinds,
  isPublishableFinanceInsuranceOption,
  parseFinanceInsuranceAdminInput,
  parseFinanceInsuranceFilters,
} from "../src/lib/finance-insurance.ts";

const source = readFileSync(fileURLToPath(new URL("../src/lib/finance-insurance.ts", import.meta.url)), "utf8");
const past = "2026-09-20T10:00:00.000Z";
const asOf = new Date("2026-09-26T12:00:00.000Z");
const valid = {
  provider_name: "Example Provider",
  product_name: "Student product",
  kind: "student_financing_option",
  description: "Factual product description",
  official_source_url: "https://provider.example/official",
  application_url: "https://provider.example/apply",
  price_notes: "See the official source for current pricing.",
  eligibility_notes: "The provider publishes its own conditions.",
  verified_at: past,
  is_active: true,
};

test("TypeScript exposes exactly the three catalogue kinds", () => {
  assert.deepEqual(financeInsuranceKinds, [
    "blocked_account_provider",
    "health_insurance_provider",
    "student_financing_option",
  ]);
});

test("admin parser is strict, bounded, normalizes strings, and validates URLs", () => {
  const parsed = parseFinanceInsuranceAdminInput({ ...valid, provider_name: "  Example Provider  " });
  assert.equal(parsed.ok, true);
  assert.equal(parsed.ok && parsed.value.provider_name, "Example Provider");
  assert.equal(parseFinanceInsuranceAdminInput({ ...valid, extra: true }).ok, false);
  assert.equal(parseFinanceInsuranceAdminInput({ ...valid, provider_name: "x".repeat(181) }).ok, false);
  assert.equal(parseFinanceInsuranceAdminInput({ ...valid, official_source_url: "javascript:alert(1)" }).ok, false);
  assert.equal(parseFinanceInsuranceAdminInput({ ...valid, application_url: "ftp://provider.example" }).ok, false);
});

test("unknown optional facts remain null without estimates", () => {
  const parsed = parseFinanceInsuranceAdminInput({
    ...valid,
    product_name: null,
    description: null,
    application_url: null,
    price_notes: null,
    eligibility_notes: null,
  });
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.ok && {
    product_name: parsed.value.product_name,
    description: parsed.value.description,
    application_url: parsed.value.application_url,
    price_notes: parsed.value.price_notes,
    eligibility_notes: parsed.value.eligibility_notes,
  }, {
    product_name: null,
    description: null,
    application_url: null,
    price_notes: null,
    eligibility_notes: null,
  });
});

test("publication is fail-closed for activity, verification time, and URLs", () => {
  assert.equal(isPublishableFinanceInsuranceOption(valid, asOf), true);
  assert.equal(isPublishableFinanceInsuranceOption({ ...valid, is_active: false }, asOf), false);
  assert.equal(isPublishableFinanceInsuranceOption({ ...valid, verified_at: null }, asOf), false);
  assert.equal(isPublishableFinanceInsuranceOption({ ...valid, verified_at: "2026-10-01T00:00:00.000Z" }, asOf), false);
  assert.equal(isPublishableFinanceInsuranceOption({ ...valid, official_source_url: "not-a-url" }, asOf), false);
  assert.equal(isPublishableFinanceInsuranceOption({ ...valid, application_url: "file:///tmp/form" }, asOf), false);
});

test("filters remain limited to factual kind and provider fields", () => {
  assert.deepEqual(parseFinanceInsuranceFilters({ kind: "health_insurance_provider", provider_name: " Provider " }), {
    ok: true,
    value: { kind: "health_insurance_provider", provider_name: "Provider" },
  });
  assert.equal(parseFinanceInsuranceFilters({ kind: "unknown" }).ok, false);
  for (const forbidden of ["recommendation", "score", "ranking", "legal_threshold", "tls_workflow"]) {
    assert.equal(parseFinanceInsuranceFilters({ [forbidden]: true }).ok, false, forbidden);
  }
});

test("module contains no decision, ranking, promise, regulatory amount, or external workflow", () => {
  for (const pattern of [
    /recommended for you/i,
    /required for your visa/i,
    /visa guaranteed/i,
    /eligible for (?:a )?visa/i,
    /visa probability/i,
    /blocked.account.{0,30}\b\d{4,}\b/i,
    /visa.{0,30}(?:amount|threshold).{0,30}\b\d+/i,
    /eligibility engine/i,
    /provider (?:ranking|score)/i,
    /tlscontact|consular services portal/i,
  ]) assert.doesNotMatch(source, pattern);
});
