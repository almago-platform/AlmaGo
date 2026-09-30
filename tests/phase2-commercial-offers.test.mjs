import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0039_phase2_versioned_commercial_offers.sql",
  "utf8",
);

test("P2.8A defines stable Bronze Silver Gold identities without published seed content", () => {
  for (const code of ["bronze", "silver", "gold"]) {
    assert.match(migration, new RegExp(`'${code}'`));
  }
  assert.match(migration, /insert into public\.commercial_offers \(code\)/i);
  assert.doesNotMatch(
    migration,
    /insert into public\.commercial_offer_versions/i,
  );
});

test("commercial offer content is versioned and historically retained", () => {
  assert.match(
    migration,
    /create table if not exists public\.commercial_offer_versions/i,
  );
  assert.match(migration, /version integer not null check \(version >= 1\)/i);
  assert.match(
    migration,
    /unique \(offer_id, version\)/i,
  );
  assert.match(
    migration,
    /create index if not exists commercial_offer_versions_offer_history_idx/i,
  );
  assert.match(
    migration,
    /revoke delete, truncate on table public\.commercial_offer_versions from service_role/i,
  );
});

test("only complete configured versions can be published", () => {
  assert.match(
    migration,
    /status <> 'published'::public\.commercial_offer_version_status[\s\S]*price_minor is not null[\s\S]*currency is not null[\s\S]*published_at is not null/i,
  );
  assert.match(
    migration,
    /price_minor is null or price_minor >= 0/i,
  );
  assert.match(migration, /currency ~ '\^\[A-Z\]\{3\}\$'/i);
  assert.match(
    migration,
    /jsonb_array_length\(service_items\) between 1 and 20/i,
  );
  assert.match(
    migration,
    /commercial_offer_versions_one_published_idx[\s\S]*where status = 'published'/i,
  );
});

test("prospects can read published offers only and cannot write commercial data", () => {
  assert.match(
    migration,
    /alter table public\.commercial_offers enable row level security/i,
  );
  assert.match(
    migration,
    /alter table public\.commercial_offer_versions enable row level security/i,
  );
  assert.match(
    migration,
    /revoke all on table public\.commercial_offers from anon/i,
  );
  assert.match(
    migration,
    /revoke all on table public\.commercial_offer_versions from anon/i,
  );
  assert.match(
    migration,
    /revoke insert, update, delete, truncate[\s\S]*commercial_offer_versions[\s\S]*from authenticated/i,
  );
  assert.match(
    migration,
    /status = 'published'::public\.commercial_offer_version_status[\s\S]*or \(select public\.is_admin\(\)\)/i,
  );
});

test("P2.8A stays provider neutral and contains no payment or client activation implementation", () => {
  assert.doesNotMatch(
    migration,
    /stripe|paypal|adyen|mollie|checkout|webhook|payment_intent/i,
  );
  assert.doesNotMatch(
    migration,
    /insert into public\.customer_access|update public\.customer_access|client_active|payment_pending/i,
  );
});

test("prices and final offer content are not hardcoded into published rows", () => {
  assert.doesNotMatch(migration, /€|EUR\s*[0-9]|[0-9]+\s*EUR/i);
  assert.doesNotMatch(migration, /admission garantie|visa garanti|guaranteed admission|guaranteed visa/i);
  assert.doesNotMatch(migration, /insert into public\.commercial_offer_versions/i);
});
