import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const migration = read("supabase/migrations/20261007053500_admin_case_journal.sql");
const route = read("src/app/api/admin/dossiers/[studentId]/notes/route.ts");
const panel = read("src/components/admin/AdminCaseJournalPanel.tsx");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");
const people = read("src/app/admin/people/page.tsx");

test("Admin V7 adds an internal-only immutable case journal", () => {
  assert.match(migration, /create table if not exists public\.student_case_notes/);
  assert.match(migration, /student case notes admin read/);
  assert.match(migration, /student case notes admin insert/);
  assert.match(migration, /public\.is_admin\(\)/);
  assert.match(migration, /grant select, insert on table public\.student_case_notes/);
  assert.doesNotMatch(migration, /grant .*update.*student_case_notes/i);
  assert.doesNotMatch(migration, /grant .*delete.*student_case_notes/i);
});

test("Admin V7 journal API is admin-only and never writes student_history", () => {
  assert.match(route, /getAdminUser/);
  assert.match(route, /if \(!isAdmin\)/);
  assert.match(route, /from\("student_case_notes"\)/);
  assert.match(route, /author_id: user\.id/);
  assert.doesNotMatch(route, /student_history/);
});

test("Admin V7 dossier 360 exposes a clearly internal journal", () => {
  assert.match(dossier, /AdminCaseJournalPanel/);
  assert.match(dossier, /from\("student_case_notes"\)/);
  assert.match(dossier, /#journal/);
  assert.match(panel, /Journal interne/);
  assert.match(panel, /Ce journal n’est jamais montré à l’étudiant/);
  assert.match(panel, /Les notes sont conservées comme historique interne immuable/);
});

test("Admin V7 captures operational contact channels without pretending to send messages", () => {
  for (const label of [
    "Appel",
    "E-mail",
    "WhatsApp",
    "Rendez-vous",
    "Demande de document",
    "Contact université",
  ]) {
    assert.ok(panel.includes(label), label);
  }
  assert.doesNotMatch(panel, /sendEmail|sendMessage|sendWhatsapp/i);
});

test("Admin V7 people cockpit supports stale-contact follow-up", () => {
  assert.match(people, /Sans contact 14 j/);
  assert.match(people, /student_case_notes/);
  assert.match(people, /latestContactByUser/);
  assert.match(people, /staleContactCutoff/);
  assert.match(people, /Aucun contact journalisé/);
  assert.match(people, /lastContactAt/);
});
