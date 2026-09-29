import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/page.tsx", "utf8");
const dashboardCopy = readFileSync("src/content/student-dashboard-copy.ts", "utf8");
const journey = readFileSync("src/components/student/StudentJourneyOverview.tsx", "utf8");
const shared = readFileSync("src/content/student-shared-copy.ts", "utf8");

test("student dashboard keeps the existing Supabase data contract", () => {
  assert.ok(page.includes('from("student_checklist_items")'));
  assert.ok(page.includes('from("documents")'));
  assert.ok(page.includes('from("program_recommendations")'));
  assert.ok(page.includes('from("applications")'));
  assert.ok(page.includes('if (!profile?.onboarding_completed) redirect("/student/onboarding")'));
});

test("student dashboard preserves next-action priority logic", () => {
  assert.ok(page.includes("documentsNeedingAction"));
  assert.ok(page.includes("t.documentsAction"));
  assert.ok(dashboardCopy.includes('documentsAction: "Corriger mes documents"'));
  assert.ok(page.includes("actionableApplication?.next_action"));
  assert.ok(page.includes("t.applicationAction"));
  assert.ok(page.includes("nextItem"));
  assert.ok(page.includes("t.checklistAction"));
});

test("student dashboard V2 centers the first view on what matters now", () => {
  assert.ok(page.includes("t.heroLead"));
  assert.ok(page.includes("t.nextActionEyebrow"));
  assert.ok(page.includes("t.preparation"));
  assert.ok(page.includes("t.dossierTitle"));
  assert.ok(dashboardCopy.includes('heroLead: "Voici ce qui compte maintenant."'));
  assert.ok(page.includes("sm:grid-cols-2 xl:grid-cols-4"));
});

test("journey overview uses localized visual cards and remains responsive", () => {
  assert.ok(journey.includes("rounded-[1rem]"));
  assert.ok(journey.includes("sm:grid-cols-2 xl:grid-cols-3"));
  assert.ok(journey.includes("openArrow"));
  assert.ok(journey.includes("copy.active"));
  assert.ok(shared.includes('open: "Ouvrir"'));
  assert.ok(shared.includes('active: "Étape en cours"'));
});

test("dashboard retains legal framing around progress and decisions in every locale", () => {
  assert.ok(dashboardCopy.includes("ne représente ni une admission ni une validation finale"));
  assert.ok(dashboardCopy.includes("ولا يعني قبولًا جامعيًا أو قرارًا رسميًا"));
  assert.ok(dashboardCopy.includes("It is not an admission result or final decision"));
  assert.ok(dashboardCopy.includes("weder eine Zulassung noch eine endgültige Entscheidung"));
  assert.ok(page.includes("t.progressBoundary"));
  assert.ok(page.includes("t.dossierText"));
});
