import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/0038_phase2_human_qualification_review.sql",
  "utf8",
);
const route = readFileSync(
  "src/app/api/admin/prospects/qualification-review/route.ts",
  "utf8",
);
const page = readFileSync("src/app/admin/prospects/page.tsx", "utf8");
const form = readFileSync(
  "src/components/admin/ProspectQualificationReviewForm.tsx",
  "utf8",
);
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");

test("P2.7E RPC independently verifies admin role and current orientation", () => {
  assert.match(migration, /set search_path = ''/);
  assert.match(
    migration,
    /from public\.user_roles ur[\s\S]*ur\.user_id = p_admin_user_id[\s\S]*ur\.role = 'admin'/i,
  );
  assert.match(
    migration,
    /order by o\.created_at desc, o\.id desc[\s\S]*v_latest_orientation_id is distinct from p_orientation_id/i,
  );
});

test("human review is stale-safe, append-only and starts from ready_for_review", () => {
  assert.match(
    migration,
    /v_latest_qualification_id is distinct from p_expected_latest_qualification_id/i,
  );
  assert.match(
    migration,
    /v_latest_state <> 'ready_for_review'::public\.prospect_qualification_state/i,
  );
  assert.match(migration, /insert into public\.prospect_qualifications/i);
  assert.match(migration, /'human_review'::public\.prospect_qualification_origin/i);
  assert.match(migration, /reviewer_user_id/);
  assert.match(migration, /review_reason/);
  assert.match(migration, /supersedes_id/);
  assert.doesNotMatch(migration, /update public\.prospect_qualifications/i);
});

test("commercial transition is bounded to prospect_account -> qualified_prospect", () => {
  assert.match(
    migration,
    /v_access_status <> 'prospect_account'::public\.customer_lifecycle_status/i,
  );
  assert.match(
    migration,
    /update public\.customer_access[\s\S]*status = 'qualified_prospect'::public\.customer_lifecycle_status/i,
  );
  assert.match(
    migration,
    /where user_id = v_user_id[\s\S]*status = 'prospect_account'::public\.customer_lifecycle_status/i,
  );
  assert.doesNotMatch(migration, /client_active|client_completed|payment_pending|paid_pending_validation/);
});

test("review RPC is service-role-only", () => {
  assert.match(
    migration,
    /revoke execute on function public\.review_phase2_prospect_qualification[\s\S]*from public, anon, authenticated/i,
  );
  assert.match(
    migration,
    /grant execute on function public\.review_phase2_prospect_qualification[\s\S]*to service_role/i,
  );
});

test("admin API verifies session role and never accepts reviewer identity from browser", () => {
  assert.match(route, /getAdminUser\(\)/);
  assert.match(route, /if \(!isAdmin\)/);
  assert.match(route, /p_admin_user_id: user\.id/);
  assert.match(route, /p_orientation_id: orientationId/);
  assert.match(route, /p_expected_latest_qualification_id: expectedQualificationId/);
  assert.doesNotMatch(route, /record\.(?:admin|adminId|reviewer|reviewerId|userId|user_id)/);
  assert.match(route, /reason\.length < 10/);
  assert.match(route, /reason\.length > 1000/);
});

test("admin prospect queue reviews only ready prospect accounts and does not expose review notes", () => {
  assert.match(page, /from\("prospect_qualifications"\)/);
  assert.match(page, /qualification\?\.state === "ready_for_review"/);
  assert.match(page, /accessStatus === "prospect_account"/);
  assert.match(page, /ProspectQualificationReviewForm/);
  assert.doesNotMatch(page, /review_reason|reviewer_user_id/);
  assert.match(shell, /href: "\/admin\/prospects"/);
});

test("review form submits only bounded review inputs", () => {
  assert.match(form, /"\/api\/admin\/prospects\/qualification-review"/);
  assert.match(form, /orientationId/);
  assert.match(form, /expectedQualificationId: qualificationId/);
  assert.match(form, /decision/);
  assert.match(form, /reason: trimmed/);
  assert.match(form, /"qualified_prospect"/);
  assert.match(form, /"needs_verification"/);
  assert.doesNotMatch(form, /client_active|payment_pending|paid_pending_validation/);
});
