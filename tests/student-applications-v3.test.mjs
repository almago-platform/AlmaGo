import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/student/StudentApplicationsPanel.tsx", "utf8");
const workspace = readFileSync("src/content/student-applications-workspace-copy.ts", "utf8");

test("applications V3 exposes a global four-stage pipeline", () => {
  assert.ok(panel.includes("function applicationPipelineBucket"));
  assert.ok(panel.includes("const pipelineCounts = applications.reduce"));
  assert.ok(panel.includes("data-applications-pipeline"));
  assert.ok(panel.includes("workspace.stages.preparing"));
  assert.ok(panel.includes("workspace.stages.ready"));
  assert.ok(panel.includes("workspace.stages.submitted"));
  assert.ok(panel.includes("workspace.stages.decision"));
});

test("applications are sorted by student urgency before ordinary active work", () => {
  assert.ok(panel.includes("function isUrgentApplication"));
  assert.ok(panel.includes("function applicationPriority"));
  assert.ok(panel.includes("const urgentApplications = activeApplications"));
  assert.ok(panel.includes("const priorityApplication = urgentApplications[0] || actionable[0]"));
  assert.ok(panel.includes("applicationPriority(a) - applicationPriority(b)"));
  assert.ok(panel.includes("days !== null && days <= 14"));
});

test("applications can be filtered by action, urgency, submitted state, decision and university", () => {
  assert.ok(panel.includes('useState<"all" | "action" | "urgent" | "submitted" | "decision">("all")'));
  assert.ok(panel.includes('const [universityFilter, setUniversityFilter] = useState("all")'));
  assert.ok(panel.includes("data-application-filters"));
  assert.ok(panel.includes('applicationFilter === "action"'));
  assert.ok(panel.includes('applicationFilter === "urgent"'));
  assert.ok(panel.includes('applicationFilter === "submitted"'));
  assert.ok(panel.includes('applicationFilter === "decision"'));
  assert.ok(panel.includes("university === universityFilter"));
  assert.ok(panel.includes("visibleApplications.map"));
});

test("urgent cards expose a visible deadline badge without removing the existing stepper", () => {
  assert.ok(panel.includes("applicationUrgent"));
  assert.ok(panel.includes("workspace.overdueBadge"));
  assert.ok(panel.includes("workspace.urgentBadge"));
  assert.ok(panel.includes("<ApplicationStepper"));
  assert.ok(panel.includes("<details className="));
});

test("pipeline and filter copy is available in all four locales", () => {
  for (const expected of [
    'pipelineEyebrow: "Pipeline candidatures"',
    'pipelineEyebrow: "مسار طلبات التقديم"',
    'pipelineEyebrow: "Application pipeline"',
    'pipelineEyebrow: "Bewerbungs-Pipeline"',
    'urgentBadge: "Sous 14 jours"',
    'urgentBadge: "خلال 14 يومًا"',
    'urgentBadge: "Within 14 days"',
    'urgentBadge: "Innerhalb 14 Tagen"',
  ]) {
    assert.ok(workspace.includes(expected), `missing workspace copy: ${expected}`);
  }
});

test("filtered empty state resets both application filters", () => {
  assert.ok(panel.includes("workspace.filteredEmptyTitle"));
  assert.ok(panel.includes('setApplicationFilter("all"); setUniversityFilter("all");'));
});
