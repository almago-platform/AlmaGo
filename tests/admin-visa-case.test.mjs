import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  visaStatuses, visaTransitions, canTransitionVisa, requiresVisaProof,
  requiresNewVisaProof, isVisaStatus, validVisaSourceDate, normalizeVisaSourceUrl,
} from "../src/lib/admin/visa-workflow.ts";

const migration = readFileSync("supabase/migrations/20261008180000_admin_visa_case_workflow.sql","utf8");
const route = readFileSync("src/app/api/admin/visa/[studentId]/route.ts","utf8");
const page = readFileSync("src/app/admin/visa/[studentId]/page.tsx","utf8");
const client = readFileSync("src/components/admin/AdminVisaCasePanel.tsx","utf8");
const queue = readFileSync("src/app/admin/accompagnement/page.tsx","utf8");

test("seven visa statuses with limited transitions", () => {
  assert.deepEqual(visaStatuses, [
    "collecting","ready_for_review","submitted","appointment",
    "awaiting_decision","approved","refused",
  ]);
  for (const from of visaStatuses) {
    assert.ok(canTransitionVisa(from, from));
    for (const to of visaStatuses)
      assert.equal(canTransitionVisa(from,to), from === to || visaTransitions[from].includes(to));
  }
  assert.equal(canTransitionVisa("collecting","approved"),false);
  assert.equal(canTransitionVisa("submitted","approved"),false);
  assert.equal(canTransitionVisa("awaiting_decision","approved"),true);
  assert.equal(isVisaStatus("guaranteed"),false);
});

test("submission appointment and decisions demand newly approved own-student documents", () => {
  for(const step of ["submitted","appointment","awaiting_decision","approved","refused"])
    assert.equal(requiresVisaProof(step),true);
  for(const step of ["submitted","appointment","approved","refused"])
    assert.equal(requiresNewVisaProof(step),true);
  assert.equal(requiresVisaProof("collecting"),false);
  assert.match(migration,/visa_case_transition_requires_approved_evidence/);
  assert.match(migration,/visa_case_new_stage_requires_new_documentary_proof/);
  assert.match(migration,/d\.student_id = new\.student_id/);
  assert.match(migration,/d\.category = 'other'/);
  assert.match(migration,/d\.status = 'approved'/);
  assert.match(route,/validateApprovedProof\(supabase, studentId, proposedEvidence\)/);
  assert.match(route,/requiresNewVisaProof\(target\)/);
});

test("MFA RLS and append-only audit are enforced by SQL", () => {
  assert.match(migration,/alter table public\.visa_cases enable row level security;/);
  assert.match(migration,/alter table public\.visa_case_events enable row level security;/);
  assert.match(migration,/revoke all on table public\.visa_cases, public\.visa_case_events from public, anon, authenticated/);
  assert.match(migration,/grant select,insert,update on public\.visa_cases to authenticated/);
  assert.match(migration,/grant select on public\.visa_case_events to authenticated/);
  assert.match(migration,/select public\.is_admin\(\)/);
  assert.match(migration,/aal2/);
  assert.match(migration,/create trigger visa_cases_guard/);
  assert.match(migration,/create trigger visa_cases_audit/);
  assert.match(migration,/unique\(student_id,version\)/);
  assert.match(migration,/security definer\s+set search_path = ''/);
  assert.match(migration,/revoke all on function private\.audit_visa_case\(\)/);
});

test("server route checks admin MFA locks and rejected foreign evidence", () => {
  assert.match(route,/getAdminUser/);
  assert.match(route,/if \(!isAdmin\)/);
  assert.match(route,/Number\.isSafeInteger\(body\.version\)/);
  assert.match(route,/\.eq\("version", Number\(body\.version\)\)/);
  assert.match(route,/updated_by: user\.id/);
  assert.match(route,/allowedKeys/);
  assert.match(route,/error\.code === "23505"/);
  assert.match(route,/status: "collecting"/);
  assert.doesNotMatch(route,/service_role|createAdminClient/);
});

test("consular source dates URLs and credentials are checked", () => {
  const now = new Date("2026-10-08T09:00:00Z");
  assert.equal(validVisaSourceDate("2026-10-08",now),true);
  assert.equal(validVisaSourceDate("2026-10-07",now),true);
  assert.equal(validVisaSourceDate("2026-10-09",now),false);
  assert.equal(validVisaSourceDate("2026-02-30",now),false);
  assert.equal(validVisaSourceDate("2020-10-08",now),false);
  assert.equal(normalizeVisaSourceUrl("http://tunis.diplo.de/visa"),null);
  assert.equal(normalizeVisaSourceUrl("https://user:pass@example.org/"),null);
  assert.equal(normalizeVisaSourceUrl("javascript:alert(1)"),null);
  assert.equal(normalizeVisaSourceUrl("https://tunis.diplo.de/visa"),"https://tunis.diplo.de/visa");
});

test("candidate entry links to evidenced visa UI, never invents a visa", () => {
  assert.match(queue,/Suivi visa →/);
  assert.match(page,/from\("visa_case_events"\)/);
  assert.match(page,/from\("documents"\)/);
  assert.match(page,/\.eq\("status", "approved"\)/);
  assert.match(client,/window\.confirm/);
  assert.match(client,/Enregistrer et historiser/);
  assert.match(client,/Cela ne dépose aucune demande auprès de l’ambassade/);
  assert.match(client,/router\.refresh\(\)/);
  assert.doesNotMatch(client,/service_role|\.insert\(/);
});
