import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/admin/AdminDossierActionsPanel.tsx", "utf8");
const api = readFileSync("src/app/api/admin/dossiers/[studentId]/actions/route.ts", "utf8");
const people = readFileSync("src/lib/admin/people.ts", "utf8");

test("UX-4 shows only three genuine human Campus actions by default", () => {
  assert.match(panel, /humanOpen = useMemo/);
  assert.match(panel, /active\.filter\(\(item\) => !isSystemManagedAdminAction\(item\)\)/);
  assert.match(panel, /const campusWork = useMemo/);
  assert.match(panel, /!\["waiting_student", "waiting_external"\]\.includes\(item\.status\)/);
  assert.match(panel, /item\.owner !== "student"/);
  assert.match(panel, /item\.owner !== "external"/);
  assert.match(panel, /priorityWork = campusWork\.slice\(0, 3\)/);
  assert.match(panel, /extraWork = campusWork\.slice\(3\)/);
  assert.match(panel, /Voir les \{extraWork\.length\} autres actions Campus/);
  assert.match(panel, /"blocked" \? 0/);
  assert.match(panel, /isOverdue\(item\.due_date\) \? 1/);
});

test("UX-4 separates waiting and system-managed tasks without losing them", () => {
  assert.match(panel, /waitingOnOthers = humanOpen\.filter/);
  assert.match(panel, /systemSteps = active\.filter\(\(item\) => isSystemManagedAdminAction\(item\)\)/);
  assert.match(panel, /En attente d’un étudiant ou d’un organisme/);
  assert.match(panel, /Étapes pilotées par la procédure/);
  assert.match(panel, /waitingOnOthers\.map\(renderActionRow\)/);
  assert.match(panel, /systemSteps\.map\(renderActionRow\)/);
  assert.match(panel, /Checklist synchronisée/);
  assert.match(panel, /Étape procédure/);
  assert.match(panel, /Pilotée par la procédure/);
  assert.match(panel, /Pilotée par une synchronisation métier/);
});

test("UX-4 retains authorized actions, no invented deadlines and no new backend", () => {
  assert.match(panel, /isSystemManagedAdminAction\(item\)/);
  assert.match(panel, /mutateAction\(item\.id, "complete"\)/);
  assert.match(panel, /mutateAction\(item\.id, "reopen"\)/);
  assert.match(panel, /fetch\(`\/api\/admin\/dossiers\/\$\{studentId\}\/actions`/);
  assert.match(panel, /Ajouter une action de suivi/);
  assert.match(panel, /Cible interne facultative/);
  assert.match(panel, /Les échéances officielles restent gérées par les candidatures et les sources vérifiées/);
  assert.match(panel, /Les deadlines universitaires vérifiées restent dans Candidatures/);
  assert.match(api, /getAdminUser/);
  assert.match(api, /pilotée automatiquement et ne peut pas être modifiée ici/);
  assert.match(api, /student_history/);
  assert.match(people, /item\.template_id \|\| item\.procedure_step_template_id/);
  assert.doesNotMatch(panel, /service_role|supabase|\.rpc\(/);
});
