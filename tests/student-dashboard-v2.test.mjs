import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/student/page.tsx", "utf8");
const dashboardCopy = readFileSync("src/content/student-dashboard-copy.ts", "utf8");
const cockpitCopy = readFileSync("src/content/student-dashboard-cockpit-copy.ts", "utf8");
const checklistCopy = readFileSync("src/content/student-checklist-copy.ts", "utf8");
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

test("student dashboard cockpit centers the first view on the next action", () => {
  assert.ok(page.includes("t.nextActionEyebrow"));
  assert.ok(page.includes("cockpit.nextActionReason"));
  assert.ok(page.includes("cockpit.duration"));
  assert.ok(page.includes("cockpit.continue"));
  assert.ok(page.includes("cockpit.progressEyebrow"));
  assert.ok(cockpitCopy.includes('continue: "Continuer"'));
  assert.ok(cockpitCopy.includes('projectLabel: "Ton projet"'));
  assert.ok(page.indexOf("<NextActionPanel") < page.indexOf("<JourneyRail"));
  assert.ok(page.includes("data-dashboard-metrics"));
  assert.ok(page.includes("DashboardMetric"));
  assert.ok(page.includes("allImportantDeadlines.length"));
  assert.ok(page.includes("documentAttentionCount"));
  assert.doesNotMatch(page, /sm:grid-cols-2 xl:grid-cols-4/);
});

test("journey overview uses localized visual cards and remains responsive", () => {
  assert.ok(journey.includes("rounded-[1rem]"));
  assert.ok(journey.includes("sm:grid-cols-2 xl:grid-cols-3"));
  assert.ok(journey.includes("openArrow"));
  assert.ok(journey.includes("copy.active"));
  assert.ok(shared.includes('open: "Ouvrir"'));
  assert.ok(shared.includes('active: "Étape en cours"'));
});

test("dashboard retains legal framing around progress in every locale", () => {
  assert.ok(dashboardCopy.includes("ne représente ni une admission ni une validation finale"));
  assert.ok(dashboardCopy.includes("ولا يعني قبولًا جامعيًا أو قرارًا رسميًا"));
  assert.ok(dashboardCopy.includes("It is not an admission result or final decision"));
  assert.ok(dashboardCopy.includes("weder eine Zulassung noch eine endgültige Entscheidung"));
  assert.ok(page.includes("t.progressBoundary"));
});

test("student dashboard keeps the progress boundary in the V2 section hierarchy", () => {
  assert.ok(page.includes("SectionHeader"));
  assert.ok(page.includes("description={t.progressBoundary}"));
  assert.ok(page.includes("JourneyRail"));
  assert.ok(page.includes("ariaLabel={journeyCopy.title}"));
});

test("student dashboard renders localized copy through the canonical brand layer", () => {
  assert.match(page, /const t = rebrandCopy\(studentDashboardCopy\[locale\]\)/);
  assert.match(dashboardCopy, /AlmaGo/);
});

test("student dashboard rebrands checklist labels through the same canonical layer", () => {
  assert.match(page, /const checklistCopy = rebrandCopy\(studentChecklistCopy\[locale\]\)/);
  assert.match(checklistCopy, /AlmaGo/);
});


test("cockpit exposes project summary, deadlines, saved programmes, missing documents, applications and recent activity", () => {
  assert.match(page, /target_degree,target_field,target_intake/);
  assert.match(page, /const importantDeadlines/);
  assert.match(page, /missingRequiredDocuments/);
  assert.match(page, /const recentActivities/);
  assert.match(page, /cockpit\.programmesTitle/);
  assert.match(page, /cockpit\.documentsTitle/);
  assert.match(page, /cockpit\.applicationsTitle/);
  assert.match(page, /cockpit\.activityTitle/);
  assert.match(page, /application_events\(id,event_type,message,created_at\)/);
});
