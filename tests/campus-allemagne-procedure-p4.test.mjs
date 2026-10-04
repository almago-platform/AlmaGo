import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import {
  buildCampusInternalTargets,
  evaluateCampusApplicationDeadline,
  evaluateCampusOfficialDeadline,
} from "../src/lib/orientation-engine/deadline.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");
const migration = read("supabase/migrations/0052_campus_allemagne_deadline_engine.sql");
const dashboard = read("src/app/student/page.tsx");
const applicationsPage = read("src/app/student/applications/page.tsx");
const applicationsPanel = read("src/components/student/StudentApplicationsPanel.tsx");

test("P4 official deadlines require date, source, verified-at and matching cycle", () => {
  const now = new Date("2026-10-04T12:00:00Z");

  assert.equal(
    evaluateCampusOfficialDeadline({
      kind: "official_hard_deadline",
      date: "2027-07-15",
      cycle: "winter 2027",
      sourceUrl: "https://example.edu/deadline",
      verifiedAt: "2026-10-04T09:00:00Z",
    }, now).status,
    "open",
  );

  for (const invalid of [
    { sourceUrl: null },
    { verifiedAt: null },
    { cycle: null },
    { cycle: "winter 2028" },
  ]) {
    assert.equal(
      evaluateCampusOfficialDeadline({
        kind: "official_hard_deadline",
        date: "2027-07-15",
        cycle: "winter 2027",
        sourceUrl: "https://example.edu/deadline",
        verifiedAt: "2026-10-04T09:00:00Z",
        ...invalid,
      }, now).status,
      "to_verify",
    );
  }
});

test("P4 unknown official dates stay unknown rather than receiving a fabricated countdown", () => {
  const result = evaluateCampusApplicationDeadline({
    deadline: null,
    deadline_kind: "official_hard_deadline",
    deadline_cycle: "winter 2027",
    deadline_source_url: "https://example.edu/deadline",
    deadline_verified_at: "2026-10-04T09:00:00Z",
  }, new Date("2026-10-04T12:00:00Z"));

  assert.equal(result.status, "unknown");
  assert.deepEqual(buildCampusInternalTargets(result, "direct"), []);
});

test("P4 internal targets are derived only from a verified open official hard deadline", () => {
  const official = evaluateCampusOfficialDeadline({
    kind: "official_hard_deadline",
    date: "2027-07-15",
    cycle: "winter 2027",
    sourceUrl: "https://example.edu/deadline",
    verifiedAt: "2026-10-04T09:00:00Z",
  }, new Date("2026-10-04T12:00:00Z"));

  assert.deepEqual(
    buildCampusInternalTargets(official, "direct"),
    [
      { key: "documents_ready", kind: "internal_target", date: "2027-04-22", offsetDays: -84 },
      { key: "authentication_translation_ready", kind: "internal_target", date: "2027-05-06", offsetDays: -70 },
      { key: "direct_submit_target", kind: "internal_target", date: "2027-06-24", offsetDays: -21 },
      { key: "final_review", kind: "internal_target", date: "2027-07-08", offsetDays: -7 },
    ],
  );

  assert.deepEqual(
    buildCampusInternalTargets(official, "uni_assist").map((item) => item.key),
    ["documents_ready", "authentication_translation_ready", "uni_assist_submit_target", "final_review"],
  );

  assert.deepEqual(
    buildCampusInternalTargets(official, "vpd_then_direct").map((item) => item.key),
    ["documents_ready", "authentication_translation_ready", "vpd_request_target", "direct_submit_target", "final_review"],
  );
});

test("P4 persists deadline provenance on the existing applications table", () => {
  assert.match(migration, /alter table public\.applications/i);
  assert.match(migration, /deadline_source_url text/i);
  assert.match(migration, /deadline_verified_at timestamptz/i);
  assert.match(migration, /deadline_cycle text/i);
  assert.match(migration, /application_method text/i);
  assert.doesNotMatch(migration, /create table[^;]*deadline/i);
});

test("P4 verified deadline mutation is admin-only and auditable", () => {
  assert.match(migration, /create or replace function public\.admin_set_application_deadline/i);
  assert.match(migration, /if not public\.is_admin\(\) then/i);
  assert.match(migration, /deadline_source_verified_at_and_cycle_required/i);
  assert.match(migration, /invalid_deadline_provenance/i);
  assert.match(migration, /application_deadline_verified/i);
  assert.match(migration, /insert into public\.student_history/i);
  assert.match(migration, /admin_mark_application_deadline_to_verify/i);
  assert.match(migration, /application_deadline_to_verify/i);
});

test("P4 student surfaces read provenance and do not promote unverified dates", () => {
  for (const source of [dashboard, applicationsPage]) {
    assert.match(source, /deadline_source_url/);
    assert.match(source, /deadline_verified_at/);
    assert.match(source, /deadline_cycle/);
  }

  assert.match(dashboard, /evaluateCampusApplicationDeadline\(application\)\.status === "open"/);
  assert.match(applicationsPanel, /evaluateCampusApplicationDeadline/);
  assert.doesNotMatch(applicationsPanel, /nextActiveDeadline/);
  assert.doesNotMatch(applicationsPanel, /isPastDeadline/);
});
