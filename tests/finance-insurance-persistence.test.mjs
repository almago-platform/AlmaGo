import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { financeInsuranceKinds } from "../src/lib/finance-insurance.ts";

const migration = readFileSync(
  fileURLToPath(new URL("../supabase/migrations/0019_germany_finance_insurance_catalog.sql", import.meta.url)),
  "utf8",
);

test("SQL and TypeScript catalogue kinds have exact parity", () => {
  const enumMatch = migration.match(/create type public\.finance_insurance_kind as enum \(([\s\S]*?)\);/i);
  assert.ok(enumMatch);
  const sqlKinds = [...enumMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.deepEqual(sqlKinds, [...financeInsuranceKinds]);
});

test("persistence contains the complete nullable factual contract", () => {
  for (const field of [
    "id", "provider_name", "product_name", "kind", "description", "official_source_url",
    "application_url", "price_notes", "eligibility_notes", "verified_at", "is_active",
    "created_at", "updated_at",
  ]) assert.match(migration, new RegExp(`\\b${field}\\b`), field);

  for (const field of ["product_name", "description", "application_url", "price_notes", "eligibility_notes", "verified_at"]) {
    const definition = migration.match(new RegExp(`\\b${field}\\b[^,;]*`, "i"))?.[0] ?? "";
    assert.doesNotMatch(definition, /not null|default/i, field);
  }
});

test("published read policy is fail-closed and admin writes use public.is_admin", () => {
  assert.match(migration, /alter table public\.finance_insurance_catalog enable row level security/i);
  assert.match(migration, /for select to authenticated[\s\S]*is_active = true[\s\S]*verified_at is not null[\s\S]*verified_at <= now\(\)/i);
  assert.match(migration, /official_source_url ~\* '\^https\?\:\/\//i);
  assert.match(migration, /application_url is null[\s\S]*application_url ~\* '\^https\?\:\/\//i);

  for (const operation of ["insert", "update", "delete"]) {
    assert.match(migration, new RegExp(`create policy "finance insurance admin ${operation}"[\\s\\S]*public\\.is_admin\\(\\)`, "i"));
  }
  assert.doesNotMatch(migration, /finance insurance student (?:insert|update|delete)/i);
});

test("migration has no privileged application secret or product-boundary logic", () => {
  assert.doesNotMatch(migration, /service_role/i);
  for (const pattern of [
    /blocked.account.{0,30}\b\d{4,}\b/i,
    /visa.{0,30}(?:amount|threshold).{0,30}\b\d+/i,
    /accepted.{0,20}visa/i,
    /eligibility (?:calculation|engine)/i,
    /provider (?:ranking|score|recommendation)/i,
    /tlscontact|consular services portal/i,
  ]) assert.doesNotMatch(migration, pattern);
});

test("static SQL assertions document policy intent rather than emulate PostgreSQL", () => {
  assert.match(migration, /create trigger finance_insurance_catalog_set_updated_at/i);
  assert.match(migration, /execute procedure public\.set_updated_at\(\)/i);
});
