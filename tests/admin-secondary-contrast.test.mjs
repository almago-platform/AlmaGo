import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const files = [
  "src/app/admin/page.tsx",
  "src/components/admin/AdminApplicationsPanel.tsx",
  "src/components/admin/AdminDocumentsPanel.tsx",
  "src/components/admin/AdminFinanceInsurancePanel.tsx",
  "src/components/admin/AdminLanguageCoursesPanel.tsx",
  "src/components/admin/AdminOrientationHumanReviewQueue.tsx",
  "src/components/admin/AdminOrientationPanel.tsx",
  "src/components/admin/AdminProgramsPanel.tsx",
  "src/components/admin/AdminUniversitiesPanel.tsx",
];

test("admin secondary text avoids slate-500 on ivory surfaces", () => {
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /text-slate-500/, file);
  }
});
