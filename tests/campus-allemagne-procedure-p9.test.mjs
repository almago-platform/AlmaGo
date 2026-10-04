import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";
import {
  buildCampusInternalTargets,
  evaluateCampusOfficialDeadline,
} from "../src/lib/orientation-engine/deadline.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const p1 = read("supabase/migrations/0049_campus_allemagne_procedure_foundation.sql");
const p2 = read("supabase/migrations/0050_campus_allemagne_procedure_generator.sql");
const p3 = read("supabase/migrations/0051_campus_allemagne_smart_documents.sql");
const p4 = read("supabase/migrations/0052_campus_allemagne_deadline_engine.sql");
const p7 = read("supabase/migrations/0053_campus_allemagne_notifications.sql");
const p8 = read("supabase/migrations/0054_campus_allemagne_source_freshness.sql");
const studentProcedure = read("src/app/student/procedure/page.tsx");
const adminProcedure = read("src/app/admin/students/[studentId]/procedure/page.tsx");

test("P9 RLS contract keeps student operational truth read-only and admin-owned", () => {
  assert.match(p1, /student procedures own or admin read/i);
  assert.match(p1, /student procedures admin write/i);
  assert.match(p1, /document requirements own or admin read/i);
  assert.match(p1, /document requirements admin write/i);
  assert.match(p1, /procedure templates admin only/i);
  assert.match(p1, /procedure step templates admin only/i);
});

test("P9 route changes are auditable snapshots, never in-place procedure mutation", () => {
  assert.match(p2, /is_current = false/i);
  assert.match(p2, /insert into public\.student_procedures/i);
  assert.match(p2, /superseded_by = new_procedure_id/i);
  assert.match(p1, /procedure_changed/i);
  assert.match(p1, /insert into public\.student_history/i);
});

test("P9 VPD target semantics remain internal and use the approved buffers", () => {
  const official = evaluateCampusOfficialDeadline({
    kind: "official_hard_deadline",
    date: "2027-07-15",
    cycle: "winter 2027",
    sourceUrl: "https://example.edu/application",
    verifiedAt: "2026-10-04T09:00:00Z",
  }, new Date("2026-10-04T12:00:00Z"));

  assert.deepEqual(
    buildCampusInternalTargets(official, "vpd_then_direct"),
    [
      { key: "documents_ready", kind: "internal_target", date: "2027-04-22", offsetDays: -84 },
      { key: "authentication_translation_ready", kind: "internal_target", date: "2027-05-06", offsetDays: -70 },
      { key: "vpd_request_target", kind: "internal_target", date: "2027-05-06", offsetDays: -70 },
      { key: "direct_submit_target", kind: "internal_target", date: "2027-06-24", offsetDays: -21 },
      { key: "final_review", kind: "internal_target", date: "2027-07-08", offsetDays: -7 },
    ],
  );
});

test("P9 unknown or unverified official dates cannot produce internal targets", () => {
  for (const input of [
    {
      kind: "official_hard_deadline",
      date: null,
      cycle: "winter 2027",
      sourceUrl: "https://example.edu/application",
      verifiedAt: "2026-10-04T09:00:00Z",
    },
    {
      kind: "official_hard_deadline",
      date: "2027-07-15",
      cycle: "winter 2027",
      sourceUrl: null,
      verifiedAt: "2026-10-04T09:00:00Z",
    },
    {
      kind: "official_hard_deadline",
      date: "2027-07-15",
      cycle: "winter 2028",
      sourceUrl: "https://example.edu/application",
      verifiedAt: "2026-10-04T09:00:00Z",
    },
  ]) {
    const result = evaluateCampusOfficialDeadline(input, new Date("2026-10-04T12:00:00Z"));
    assert.ok(["unknown", "to_verify"].includes(result.status));
    assert.deepEqual(buildCampusInternalTargets(result, "direct"), []);
  }
});

test("P9 document replacement reopens the same requirement instead of creating a new workflow", () => {
  assert.match(p3, /when 'replace_required' then 'replacement_required'/i);
  assert.match(p3, /document_id = null/i);
  assert.match(p3, /status = case[\s\S]+existing_language_certificate[\s\S]+not_applicable[\s\S]+else 'requested'/i);
  assert.doesNotMatch(p3, /create table public\.campus_documents/i);
});

test("P9 student burden remains exactly the approved default", () => {
  for (const key of ["passport", "baccalaureate", "baccalaureate_transcript"]) {
    assert.match(p3, new RegExp(`'${key}'`));
  }
  assert.match(p3, /'existing_language_certificate'/);
  assert.match(p3, /'not_applicable'/);
  assert.match(p3, /requested_from_student[\s\S]+student_request_reason/i);
  assert.match(studentProcedure, /3 pièces demandées par défaut/);
});

test("P9 official and internal deadlines remain separate end-to-end", () => {
  assert.match(p4, /deadline_kind = 'official_hard_deadline'/i);
  assert.match(p7, /deadline_kind = 'official_hard_deadline'/i);
  assert.doesNotMatch(p7, /deadline_kind = 'internal_target'/i);
  assert.match(studentProcedure, /Prochaine deadline officielle/);
  assert.match(studentProcedure, /Prochain objectif Campus Allemagne/);
  assert.match(adminProcedure, /Échéances officielles et objectifs internes/);
});

test("P9 stale regulatory sources are revalidation work, not silently trusted", () => {
  assert.match(p8, /verification_status = 'needs_reverification'/i);
  assert.match(p8, /review_due_at <= p_now/i);
  assert.match(adminProcedure, /Fraîcheur des sources/);
  assert.match(adminProcedure, /À revalider/);
});

test("P9 notifications never turn internal Campus work into student obligations", () => {
  assert.match(p7, /owner in \('student', 'joint'\)/i);
  assert.match(p7, /student_action_reason is not null/i);
  assert.match(p7, /student_request_reason is not null/i);
  assert.doesNotMatch(p7, /owner = 'almago'[\s\S]+insert into public\.notifications/i);
});
