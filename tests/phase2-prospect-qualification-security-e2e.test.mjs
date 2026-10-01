import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const qualification = read("src/lib/phase2/qualification.ts");
const access = read("src/lib/phase2/access.ts");
const authAccess = read("src/lib/auth/access.ts");
const studentLayout = read("src/app/student/layout.tsx");
const prospectLayout = read("src/app/prospect/layout.tsx");
const prospectUpdate = read("src/app/api/prospect/orientation/route.ts");
const adminReview = read("src/app/api/admin/prospects/qualification-review/route.ts");
const prospectPage = read("src/app/prospect/page.tsx");
const prospectCopy = read("src/content/prospect-qualification-copy.ts");
const historyMigration = read("supabase/migrations/0036_phase2_prospect_qualification_history.sql");
const autoMigration = read("supabase/migrations/0037_phase2_atomic_orientation_qualification.sql");
const humanMigration = read("supabase/migrations/0038_phase2_human_qualification_review.sql");

test("P2.7 automatic qualification is deterministic and cannot self-promote", () => {
  assert.match(
    qualification,
    /AutomatedProspectQualificationState = Exclude<[\s\S]*"qualified_prospect"/,
  );
  const evaluator = qualification.match(
    /export function evaluateProspectQualification\([\s\S]*$/,
  )?.[0] ?? "";
  assert.doesNotMatch(evaluator, /state:\s*"qualified_prospect"/);
  assert.match(evaluator, /state:\s*"ready_for_review"/);

  assert.match(
    historyMigration,
    /prospect_qualifications_automatic_never_qualified[\s\S]*origin = 'automatic'[\s\S]*state = 'qualified_prospect'/i,
  );
  assert.match(
    autoMigration,
    /p_qualification_state = 'qualified_prospect'::public\.prospect_qualification_state[\s\S]*return/i,
  );
});

test("P2.7 authenticated project updates resolve identity server-side and fail closed on stale writes", () => {
  assert.match(prospectUpdate, /getPhase2StudentAccess/);
  assert.match(prospectUpdate, /\.eq\("user_id", access\.user\.id\)/);
  assert.match(prospectUpdate, /p_user_id: access\.user\.id/);
  assert.match(prospectUpdate, /p_prospect_id: prospect\.id/);
  assert.match(
    prospectUpdate,
    /p_expected_latest_orientation_id: latestOrientation\?\.id \?\? null/,
  );
  assert.match(prospectUpdate, /status: 409/);

  assert.doesNotMatch(
    prospectUpdate,
    /record\.(?:prospect|prospectId|prospect_id|user|userId|user_id|orientation|orientationId|orientation_id|qualification|qualificationState|state)/,
  );
  assert.match(
    autoMigration,
    /v_latest_orientation_id is distinct from p_expected_latest_orientation_id/i,
  );
  assert.match(autoMigration, /for update/i);
});

test("P2.7 qualification history is append-only and browser read-only under owner/admin RLS", () => {
  assert.match(
    historyMigration,
    /alter table public\.prospect_qualifications enable row level security/i,
  );
  assert.match(
    historyMigration,
    /revoke all on table public\.prospect_qualifications from anon/i,
  );
  assert.match(
    historyMigration,
    /grant select on table public\.prospect_qualifications to authenticated/i,
  );
  assert.match(
    historyMigration,
    /revoke insert, update, delete, truncate, references, trigger[\s\S]*from authenticated/i,
  );
  assert.match(
    historyMigration,
    /p\.user_id = \(select auth\.uid\(\)\)[\s\S]*or \(select public\.is_admin\(\)\)/i,
  );
  assert.match(
    historyMigration,
    /revoke update, delete, truncate[\s\S]*from service_role/i,
  );
  assert.doesNotMatch(historyMigration, /updated_at/i);
});

test("P2.7 human review is authenticated, independently admin-verified and stale-safe", () => {
  assert.match(adminReview, /supabase\.auth\.getUser\(\)/);
  assert.match(adminReview, /from\("user_roles"\)/);
  assert.match(adminReview, /role\?\.role !== "admin"/);
  assert.match(adminReview, /p_admin_user_id: user\.id/);
  assert.doesNotMatch(
    adminReview,
    /record\.(?:admin|adminId|reviewer|reviewerId|user|userId|user_id)/,
  );

  assert.match(
    humanMigration,
    /from public\.user_roles ur[\s\S]*ur\.user_id = p_admin_user_id[\s\S]*ur\.role = 'admin'/i,
  );
  assert.match(
    humanMigration,
    /v_latest_orientation_id is distinct from p_orientation_id/i,
  );
  assert.match(
    humanMigration,
    /v_latest_qualification_id is distinct from p_expected_latest_qualification_id/i,
  );
  assert.match(
    humanMigration,
    /v_latest_state <> 'ready_for_review'::public\.prospect_qualification_state/i,
  );
  assert.match(
    humanMigration,
    /char_length\(btrim\(p_review_reason\)\) not between 10 and 1000/i,
  );
  assert.match(humanMigration, /'human_review'::public\.prospect_qualification_origin/i);
  assert.match(humanMigration, /supersedes_id/i);
  assert.doesNotMatch(humanMigration, /update public\.prospect_qualifications/i);
});

test("P2.7 human review can promote only prospect_account to qualified_prospect", () => {
  assert.match(
    humanMigration,
    /v_access_status <> 'prospect_account'::public\.customer_lifecycle_status/i,
  );
  assert.match(
    humanMigration,
    /update public\.customer_access[\s\S]*status = 'qualified_prospect'::public\.customer_lifecycle_status/i,
  );
  assert.match(
    humanMigration,
    /status = 'prospect_account'::public\.customer_lifecycle_status/i,
  );
  assert.doesNotMatch(
    humanMigration,
    /client_active|client_completed|payment_pending|paid_pending_validation/i,
  );
});

test("qualified_prospect remains outside every Phase 1 client entitlement boundary", () => {
  assert.match(
    access,
    /const clientStatuses = new Set<CustomerLifecycleStatus>\(\[[\s\S]*"client_active"[\s\S]*"client_completed"[\s\S]*\]\)/,
  );
  assert.doesNotMatch(
    access.match(/const clientStatuses = new Set<CustomerLifecycleStatus>\([\s\S]*?\);/)?.[0] ?? "",
    /qualified_prospect/,
  );
  assert.match(
    authAccess,
    /const clientStatuses = new Set\(\["client_active", "client_completed"\]\)/,
  );
  assert.doesNotMatch(
    authAccess.match(/const clientStatuses = new Set\([^;]+;/)?.[0] ?? "",
    /qualified_prospect/,
  );

  assert.match(studentLayout, /if \(access\.phase2Enabled && !access\.canUseClientFeatures\)/);
  assert.match(studentLayout, /redirect\("\/prospect"\)/);
  assert.match(prospectLayout, /if \(!access\.phase2Enabled \|\| access\.canUseClientFeatures\)/);
  assert.match(prospectLayout, /redirect\("\/student"\)/);
});

test("P2.7 authorization never relies on user metadata", () => {
  for (const [name, source] of [
    ["phase2 access", access],
    ["auth access", authAccess],
    ["prospect update", prospectUpdate],
    ["admin review", adminReview],
    ["automatic RPC", autoMigration],
    ["human RPC", humanMigration],
  ]) {
    assert.doesNotMatch(
      source,
      /user_metadata|raw_user_meta_data|app_metadata/,
      name,
    );
  }
});

test("P2.7 prospect UI exposes only safe current qualification information", () => {
  assert.match(prospectPage, /\.select\("state,next_action"\)/);
  assert.match(prospectPage, /\.eq\("orientation_id", current\.id\)/);
  assert.doesNotMatch(
    prospectPage,
    /review_reason|reviewer_user_id|supersedes_id|reason_codes|missing_fields|verification_requirements/,
  );

  for (const state of [
    "not_evaluated",
    "too_early",
    "needs_information",
    "needs_verification",
    "ready_for_review",
    "qualified_prospect",
  ]) {
    assert.match(prospectCopy, new RegExp(`${state}:`));
  }

  assert.match(prospectCopy, /ne constitue ni une admission, ni une décision de visa/);
  assert.match(prospectCopy, /لا تمثل قبولًا جامعيًا أو قرار تأشيرة/);
  assert.match(prospectCopy, /not an admission or visa decision/);
  assert.match(prospectCopy, /weder eine Zulassungs- noch eine Visumentscheidung/);
});

test("P2.7 privileged RPCs stay service-role-only with hardened search_path", () => {
  for (const [name, migration] of [
    ["automatic recalculation", autoMigration],
    ["human review", humanMigration],
  ]) {
    assert.match(migration, /security definer/i, name);
    assert.match(migration, /set search_path = ''/i, name);
    assert.match(
      migration,
      /revoke execute on function[\s\S]*from public, anon, authenticated/i,
      name,
    );
    assert.match(
      migration,
      /grant execute on function[\s\S]*to service_role/i,
      name,
    );
  }
});
