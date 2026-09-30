import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0042_phase2_payment_foundation.sql",
  "utf8",
);

test("P2.9A snapshots immutable published offer economics into purchases", () => {
  assert.match(migration, /create table if not exists public\.commercial_purchases/i);
  assert.match(
    migration,
    /offer_version_id uuid not null references public\.commercial_offer_versions\(id\) on delete restrict/i,
  );
  assert.match(migration, /offer_snapshot jsonb not null/i);
  assert.match(migration, /amount_minor bigint not null check \(amount_minor >= 0\)/i);
  assert.match(migration, /currency text not null check \(currency ~ '\^\[A-Z\]\{3\}\$'\)/i);
});

test("payment attempts are idempotent and provider neutral", () => {
  assert.match(migration, /create table if not exists public\.payment_attempts/i);
  assert.match(migration, /provider text not null/i);
  assert.match(migration, /idempotency_key text not null unique/i);
  assert.match(
    migration,
    /payment_attempts_provider_session_unique_idx[\s\S]*\(provider, provider_session_id\)/i,
  );
  assert.doesNotMatch(
    migration,
    /stripe|paypal|adyen|mollie|checkout\.session|payment_intent/i,
  );
});

test("payment transactions are append-only and cover charge refund dispute", () => {
  for (const kind of ["charge", "refund", "dispute"]) {
    assert.match(migration, new RegExp(`'${kind}'`));
  }
  assert.match(migration, /create table if not exists public\.payment_transactions/i);
  assert.match(
    migration,
    /revoke update, delete, truncate on table public\.payment_transactions from service_role/i,
  );
  assert.match(
    migration,
    /payment_transactions_provider_id_unique_idx/i,
  );
});

test("provider events are deduplicated without storing raw payment payloads", () => {
  assert.match(migration, /create table if not exists public\.payment_provider_events/i);
  assert.match(migration, /provider_event_id text not null/i);
  assert.match(migration, /payload_sha256 text not null/i);
  assert.match(migration, /payload_sha256 ~ '\^\[0-9a-f\]\{64\}\$'/i);
  assert.match(
    migration,
    /unique \(provider, provider_event_id\)/i,
  );
  assert.doesNotMatch(
    migration,
    /raw_payload|payload json|payload jsonb|card_number|cvc|cvv/i,
  );
  assert.match(
    migration,
    /revoke all on table public\.payment_provider_events from authenticated/i,
  );
});

test("customer access transitions have append-only audit persistence but no transition is executed here", () => {
  assert.match(migration, /create table if not exists public\.customer_access_events/i);
  assert.match(migration, /previous_status public\.customer_lifecycle_status/i);
  assert.match(migration, /next_status public\.customer_lifecycle_status not null/i);
  assert.match(
    migration,
    /revoke update, delete, truncate on table public\.customer_access_events from service_role/i,
  );
  assert.doesNotMatch(migration, /update public\.customer_access/i);
  assert.doesNotMatch(migration, /insert into public\.customer_access/i);
});

test("browser writes are denied and users can read only their own payment summary", () => {
  for (const table of [
    "commercial_purchases",
    "payment_attempts",
    "payment_transactions",
    "payment_provider_events",
    "customer_access_events",
  ]) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
    );
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${table} from anon`, "i"),
    );
  }
  assert.match(
    migration,
    /commercial_purchases[\s\S]*user_id = \(select auth\.uid\(\)\)[\s\S]*or \(select public\.is_admin\(\)\)/i,
  );
  assert.match(
    migration,
    /payment_attempts[\s\S]*p\.user_id = \(select auth\.uid\(\)\)/i,
  );
  assert.match(
    migration,
    /payment_transactions[\s\S]*p\.user_id = \(select auth\.uid\(\)\)/i,
  );
});

test("P2.9A makes no real provider or checkout commitment", () => {
  assert.doesNotMatch(
    migration,
    /api[_ -]?key|secret[_ -]?key|webhook[_ -]?secret|checkout_url|return_url|success_url|cancel_url/i,
  );
  assert.doesNotMatch(
    migration,
    /create or replace function.*checkout|create or replace function.*webhook/i,
  );
});
