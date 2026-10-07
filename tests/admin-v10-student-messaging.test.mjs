import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/20261007103000_student_dossier_messages.sql");
const adminRoute = read("src/app/api/admin/dossiers/[studentId]/messages/route.ts");
const studentRoute = read("src/app/api/student/messages/route.ts");
const thread = read("src/components/product/DossierMessageThread.tsx");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const studentPage = read("src/app/student/messages/page.tsx");
const studentDashboard = read("src/app/student/page.tsx");
const people = read("src/app/admin/people/page.tsx");

test("Admin V10 adds one shared dossier message thread with strict student/admin roles", () => {
  assert.match(migration, /create table if not exists public\.student_dossier_messages/);
  assert.match(migration, /sender_role text not null check \(sender_role in \('student', 'admin'\)\)/);
  assert.match(migration, /student dossier messages own or admin read/);
  assert.match(migration, /student dossier messages student insert/);
  assert.match(migration, /student dossier messages admin insert/);
  assert.match(migration, /roles\.role = 'student'/);
  assert.match(migration, /public\.is_admin\(\)/);
});

test("Admin V10 read receipts are mutated only through scoped security-definer functions", () => {
  assert.match(migration, /student_mark_dossier_messages_read/);
  assert.match(migration, /admin_mark_dossier_messages_read/);
  assert.match(migration, /where student_id = auth\.uid\(\)/);
  assert.match(migration, /where student_id = p_student_id/);
  assert.match(migration, /grant execute on function public\.student_mark_dossier_messages_read/);
  assert.match(migration, /grant execute on function public\.admin_mark_dossier_messages_read/);
  assert.doesNotMatch(migration, /grant update on table public\.student_dossier_messages/i);
});

test("Admin V10 student replies notify the assigned advisor and admin messages notify the student", () => {
  assert.match(migration, /student_case_assignments/);
  assert.match(migration, /admin_student_message/);
  assert.match(migration, /student_dossier_message/);
  assert.match(migration, /Nouveau message Campus Allemagne/);
  assert.match(migration, /Nouvelle réponse étudiant/);
  assert.match(migration, /dedupe_key/);
  assert.doesNotMatch(migration, /sendTransactionalEmail/);
});

test("Admin V10 routes keep message creation scoped to the current actor", () => {
  assert.match(adminRoute, /getAdminUser/);
  assert.match(adminRoute, /if \(!isAdmin\)/);
  assert.match(adminRoute, /sender_id: user\.id/);
  assert.match(adminRoute, /sender_role: "admin"/);
  assert.match(studentRoute, /getPhase2StudentAccess/);
  assert.match(studentRoute, /!access\.isStudent \|\| !access\.canUseClientFeatures/);
  assert.match(studentRoute, /student_id: user\.id/);
  assert.match(studentRoute, /sender_role: "student"/);
});

test("Admin V10 dossier 360 separates student-visible messages from internal notes", () => {
  assert.match(dossier, /DossierMessageThread/);
  assert.match(dossier, /from\("student_dossier_messages"\)/);
  assert.match(dossier, /#messages/);
  assert.match(dossier, /Messages avec l’étudiant/);
  assert.match(thread, /Message visible par l’étudiant/);
  assert.match(thread, /Utilisez le Journal interne/);
});

test("Admin V10 student workspace exposes the same dossier conversation", () => {
  assert.match(studentPage, /Messages avec Campus Allemagne/);
  assert.match(studentPage, /DossierMessageThread/);
  assert.match(studentPage, /endpoint="\/api\/student\/messages"/);
  assert.match(studentDashboard, /href="\/student\/messages"/);
  assert.match(studentDashboard, /unreadCampusMessages/);
});

test("Admin V10 people cockpit surfaces unread student replies", () => {
  assert.match(people, /Réponses non lues/);
  assert.match(people, /student_dossier_messages/);
  assert.match(people, /unreadMessagesByUser/);
  assert.match(people, /unreadMessages/);
  assert.match(people, /work === "messages"/);
});
