import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const panel = readFileSync("src/components/student/DocumentsPanel.tsx", "utf8");
const workspace = readFileSync("src/content/student-documents-workspace-copy.ts", "utf8");

test("documents smart checklist uses the four-locale workspace copy", () => {
  assert.ok(panel.includes("studentDocumentsWorkspaceCopy"));
  assert.ok(panel.includes("workspace.checklistEyebrow"));
  assert.ok(panel.includes("workspace.checklistTitle"));
  assert.ok(panel.includes("workspace.checklistDescription"));
  assert.ok(panel.includes("workspace.validatedCount(approvedCount, documents.length)"));
  assert.doesNotMatch(panel, /locale === "fr" \? "Checklist intelligente"/);
});

test("documents expose quick status and category filters without changing persistence", () => {
  assert.ok(panel.includes('useState<"all" | "action" | "review" | "approved">("all")'));
  assert.ok(panel.includes('const [categoryFilter, setCategoryFilter] = useState("all")'));
  assert.ok(panel.includes("const visibleDocuments = documents.filter"));
  assert.ok(panel.includes("data-document-filters"));
  assert.ok(panel.includes('aria-pressed={statusFilter === value}'));
  assert.ok(panel.includes("workspace.categoryFilter"));
  assert.ok(panel.includes("visibleDocuments.map"));
  assert.ok(panel.includes('fetch("/api/student/documents/upload"'));
  assert.ok(panel.includes('method: "DELETE"'));
});

test("documents filters map statuses to meaningful action buckets", () => {
  assert.ok(panel.includes('statusFilter === "action" && ["rejected", "replace_required"].includes(document.status)'));
  assert.ok(panel.includes('statusFilter === "review" && ["pending", "reviewed"].includes(document.status)'));
  assert.ok(panel.includes('statusFilter === "approved" && document.status === "approved"'));
});

test("smart checklist category labels exist in all supported locales", () => {
  for (const expected of [
    'checklistEyebrow: "Checklist intelligente"',
    'checklistEyebrow: "قائمة الوثائق الذكية"',
    'checklistEyebrow: "Smart checklist"',
    'checklistEyebrow: "Intelligente Checkliste"',
    'identity: "Identité"',
    'identity: "الهوية"',
    'identity: "Identity"',
    'identity: "Identität"',
  ]) {
    assert.ok(workspace.includes(expected), `missing workspace copy: ${expected}`);
  }
});

test("filtered empty state can reset both filters", () => {
  assert.ok(panel.includes("workspace.filteredEmptyTitle"));
  assert.ok(panel.includes("workspace.filteredEmptyText"));
  assert.ok(panel.includes('setStatusFilter("all"); setCategoryFilter("all");'));
});
