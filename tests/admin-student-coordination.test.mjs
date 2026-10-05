import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (path) => readFileSync(join(root, path), "utf8");

const adminPanel = read("src/components/admin/AdminIntakePanel.tsx");
const adminIntakePage = read("src/app/admin/intake/page.tsx");
const adminDashboard = read("src/app/admin/page.tsx");
const adminRoute = read("src/app/api/admin/intake/[studentId]/route.ts");
const studentDiscussRoute = read("src/app/api/intake/route/discuss/route.ts");
const studentConfirmRoute = read("src/app/api/intake/route/confirm/route.ts");
const receipts = read("supabase/migrations/20261005113000_admin_student_coordination_receipts.sql");

test("admin proposal form calls the actual App Router endpoint", () => {
  assert.ok(adminPanel.includes('fetch(`/api/admin/intake/${item.studentId}`)'));
  assert.ok(!adminPanel.includes('fetch(`/api/admin/intake/${item.studentId}/route`)'));
  assert.match(adminRoute, /service_admin_propose_student_route/);
});

test("student discussion is surfaced as a priority admin response", () => {
  assert.match(studentDiscussRoute, /service_student_request_route_discussion/);
  assert.match(adminIntakePage, /student_responded_at/);
  assert.match(adminIntakePage, /student_question:\s*0/);
  assert.match(adminPanel, /Réponse étudiant reçue · action requise/);
  assert.match(adminPanel, /studentRespondedAt/);
  assert.match(adminPanel, /20_000/);
});

test("student acceptance and discussion create admin receipts", () => {
  assert.match(studentConfirmRoute, /service_confirm_proposed_route/);
  assert.match(receipts, /new\.status = 'student_question'/);
  assert.match(receipts, /new\.status = 'payment_pending'/);
  assert.match(receipts, /new\.status = 'paid_pending_validation'/);
  assert.match(receipts, /from public\.user_roles roles/);
  assert.match(receipts, /where roles\.role = 'admin'/);
  assert.match(receipts, /insert into public\.notifications/);
});

test("admin dashboard includes intake replies in operational priority", () => {
  assert.match(adminDashboard, /from\("student_intake_cases"\)/);
  assert.match(adminDashboard, /eq\("status", "student_question"\)/);
  assert.match(adminDashboard, /Réponse étudiant reçue/);
  assert.match(adminDashboard, /href: "\/admin\/intake"/);
  assert.match(adminDashboard, /title="Dossiers Campus"/);
});
