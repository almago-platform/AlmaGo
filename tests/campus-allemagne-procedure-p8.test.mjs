import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import { evaluateSourceFreshness } from "../src/lib/campus-source-freshness.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const migration = read("supabase/migrations/0054_campus_allemagne_source_freshness.sql");
const cockpit = read("src/app/admin/students/[studentId]/procedure/page.tsx");

test("P8 source freshness respects explicit review_due_at rather than inventing a fixed TTL", () => {
  const now = new Date("2026-10-04T12:00:00Z");
  assert.equal(evaluateSourceFreshness({
    verification_status: "verified",
    verified_at: "2026-09-26T18:30:00Z",
    review_due_at: "2026-10-26T18:30:00Z",
  }, now), "verified");

  assert.equal(evaluateSourceFreshness({
    verification_status: "verified",
    verified_at: "2026-09-01T12:00:00Z",
    review_due_at: "2026-10-01T12:00:00Z",
  }, now), "review_due");

  assert.equal(evaluateSourceFreshness({
    verification_status: "needs_reverification",
    verified_at: null,
    review_due_at: null,
  }, now), "needs_reverification");
});

test("P8 refreshes the existing regulatory source registry", () => {
  assert.match(migration, /update public\.regulatory_sources/i);
  assert.match(migration, /verification_status = 'needs_reverification'/i);
  assert.match(migration, /review_due_at <= p_now/i);
  assert.doesNotMatch(migration, /create table[^;]*source/i);
});

test("P8 source refresh is admin-only", () => {
  assert.match(migration, /create or replace function public\.admin_refresh_regulatory_source_freshness/i);
  assert.match(migration, /if not public\.is_admin\(\) then/i);
});

test("P8 cockpit surfaces source verification and review dates", () => {
  assert.match(cockpit, /from\("regulatory_sources"\)/);
  assert.match(cockpit, /verification_status/);
  assert.match(cockpit, /verified_at/);
  assert.match(cockpit, /review_due_at/);
  assert.match(cockpit, /evaluateSourceFreshness/);
  assert.match(cockpit, /Fraîcheur des sources/);
  assert.match(cockpit, /À revalider/);
});
