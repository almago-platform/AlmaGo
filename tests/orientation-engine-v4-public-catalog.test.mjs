import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const client = readFileSync("src/lib/supabase/public-catalog.ts", "utf8");
const catalog = readFileSync("src/lib/orientation-engine/catalog.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20261002153431_orientation_public_catalog_view.sql",
  "utf8",
);
const readerMigration = readFileSync(
  "supabase/migrations/20261005094500_orientation_public_catalog_reader_rpc.sql",
  "utf8",
);

test("public Orientation catalogue uses only the publishable Supabase key", () => {
  assert.match(client, /import "server-only"/);
  assert.match(client, /NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(client, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.doesNotMatch(client, /SUPABASE_SECRET_KEY|service_role/i);
  assert.match(client, /persistSession:\s*false/);
});

test("public catalogue view exposes only a bounded verified projection", () => {
  assert.match(migration, /create or replace view public\.orientation_program_catalog/);
  assert.match(migration, /security_barrier\s*=\s*true/);
  assert.match(migration, /p\.is_active/);
  assert.match(migration, /u\.is_active/);
  assert.match(migration, /p\.verified_at is not null/);
  assert.match(migration, /p\.verified_at <= now\(\)/);
  assert.match(migration, /p\.source_url ~\*/);
  assert.match(migration, /p\.application_url ~\*/);
  assert.match(migration, /u\.verified_at is not null/);
  assert.match(migration, /grant select on table public\.orientation_program_catalog to anon, authenticated/);
});

test("public catalogue reader keeps direct anon base-table access closed", () => {
  assert.doesNotMatch(migration + readerMigration, /grant\s+select\s+on\s+(?:table\s+)?public\.(?:programs|universities)\s+to\s+anon/i);
  assert.match(readerMigration, /security definer/i);
  assert.match(readerMigration, /set search_path = ''/i);
  assert.match(readerMigration, /revoke all on function public\.read_orientation_program_catalog\(\)[\s\S]*from public, anon, authenticated/i);
  assert.match(readerMigration, /grant execute on function public\.read_orientation_program_catalog\(\)[\s\S]*to anon, authenticated/i);
  assert.doesNotMatch(readerMigration, /profiles|documents|applications|student_projects|orientations/i);
});

test("bounded reader reproduces verified public filters and projection", () => {
  for (const pattern of [
    /p\.is_active/,
    /u\.is_active/,
    /u\.registry_status = 'verified_catalogue'/,
    /p\.verified_at is not null/,
    /p\.source_url ~\*/,
    /p\.application_url ~\*/,
    /u\.verified_at is not null/,
  ]) assert.match(readerMigration, pattern);
  assert.doesNotMatch(
    readerMigration,
    /almago_notes|tuition_notes|application_fee_notes|description|logo_url/i,
  );
});

test("Orientation Engine consumes only the bounded public RPC", () => {
  assert.match(catalog, /rpc\("read_orientation_program_catalog"\)/);
  assert.doesNotMatch(catalog, /from\("orientation_program_catalog"\)/);
  assert.doesNotMatch(catalog, /createPrivilegedSupabaseClient|SUPABASE_SECRET_KEY/);
  assert.match(catalog, /programme_source_url/);
  assert.match(catalog, /programme_verified_at/);
  assert.match(catalog, /university_source_url/);
  assert.match(catalog, /university_verified_at/);
});
