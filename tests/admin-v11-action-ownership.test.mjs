import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const peopleLib = read("src/lib/admin/people.ts");
const actionsPanel = read("src/components/admin/AdminDossierActionsPanel.tsx");
const actionRoute = read("src/app/api/admin/dossiers/[studentId]/actions/route.ts");
const dossier = read("src/app/admin/dossiers/[studentId]/page.tsx");

test("Admin V11 distinguishes legacy checklist sync from real procedure steps", () => {
  assert.match(peopleLib, /isSystemManagedAdminAction/);
  assert.match(peopleLib, /item\.template_id \|\| item\.procedure_step_template_id/);
  assert.match(peopleLib, /isHumanAdminAction/);

  assert.match(actionsPanel, /Étape procédure/);
  assert.match(actionsPanel, /Checklist synchronisée/);
  assert.match(actionsPanel, /Action dossier/);
  assert.match(actionsPanel, /Pilotée par la procédure/);
  assert.match(actionsPanel, /Pilotée par une synchronisation métier/);
});

test("Admin V11 never exposes a system-managed checklist or procedure step as a manual action", () => {
  assert.match(actionsPanel, /isSystemManagedAdminAction\(item\)/);
  assert.match(actionRoute, /procedure_step_template_id/);
  assert.match(actionRoute, /current\.template_id \|\| current\.procedure_step_template_id/);
  assert.match(actionRoute, /pilotée automatiquement/);
  assert.match(dossier, /isHumanAdminAction\(item\)/);
});

test("Admin V11 loads procedure step identity with dossier actions", () => {
  assert.match(dossier, /template_id,procedure_step_template_id/);
  assert.match(actionsPanel, /procedure_step_template_id: string \| null/);
});
