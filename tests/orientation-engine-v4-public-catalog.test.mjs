import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const client = readFileSync("src/lib/supabase/public-catalog.ts", "utf8");
const catalog = readFileSync("src/lib/orientation-engine/catalog.ts", "utf8");
const migration = readFileSync(
  "supabase/migrations/20261002153431_orientation_public_catalog_view.sql",
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

test("public catalogue view never grants anon access to the base tables or student data", () => {
  assert.doesNotMatch(migration, /grant\s+select\s+on\s+(?:table\s+)?public\.(?:programs|universities)\s+to\s+anon/i);
  assert.doesNotMatch(migration, /prospects|profiles|documents|applications|student_projects|orientations/i);
  assert.doesNotMatch(
    migration,
    /almago_notes|requirements|tuition_notes|application_fee_notes|description|logo_url/i,
  );
});

test("Orientation Engine consumes only the bounded view", () => {
  assert.match(catalog, /from\("orientation_program_catalog"\)/);
  assert.doesNotMatch(catalog, /createPrivilegedSupabaseClient|SUPABASE_SECRET_KEY/);
  assert.match(catalog, /programme_source_url/);
  assert.match(catalog, /programme_verified_at/);
  assert.match(catalog, /university_source_url/);
  assert.match(catalog, /university_verified_at/);
});
