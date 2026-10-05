import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/student/StudentJourneyHeader.tsx", "utf8");
const shared = readFileSync("src/content/student-shared-copy.ts", "utf8");
const pages = [
  ["project", "src/app/student/project/page.tsx"],
  ["documents", "src/app/student/documents/page.tsx"],
  ["orientation", "src/app/student/orientation/page.tsx"],
  ["checklist", "src/app/student/checklist/page.tsx"],
  ["applications", "src/app/student/applications/page.tsx"],
  ["pathway", "src/app/student/pathway/page.tsx"],
];

test("student journey header exposes the six localized core dossier steps", () => {
  assert.ok(shared.includes('journeySteps: ["Mon projet", "Documents", "Programmes", "Démarches", "Candidatures", "Parcours"]'));
  assert.ok(shared.includes('journeySteps: ["مشروعي", "المستندات", "البرامج", "الخطوات", "طلبات التقديم", "المسار"]'));
  assert.equal(header.split('href: "/student/').length - 1, 6);
  assert.ok(header.includes("shared.journeyAria"));
  assert.ok(header.includes("aria-current="));
});

test("core student journey pages keep a shared hierarchy while dossier pages use Product System V2", () => {
  for (const [key, path] of pages) {
    const source = readFileSync(path, "utf8");
    if (key === "documents" || key === "applications") {
      assert.ok(source.includes("DossierHeader"));
      assert.ok(source.includes('href="/student/procedure"'));
      assert.ok(source.includes("max-w-[92rem]"));
    } else {
      assert.ok(source.includes("StudentJourneyHeader"));
      assert.ok(source.includes(`current="${key}"`));
      assert.ok(source.includes("max-w-7xl px-4 py-5"));
    }
  }
});

test("student journey redesign does not alter data sources", () => {
  const documents = readFileSync("src/app/student/documents/page.tsx", "utf8");
  const orientation = readFileSync("src/app/student/orientation/page.tsx", "utf8");
  const applications = readFileSync("src/app/student/applications/page.tsx", "utf8");
  const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
  const pathway = readFileSync("src/app/student/pathway/page.tsx", "utf8");

  assert.ok(documents.includes('from("documents")'));
  assert.ok(orientation.includes('from("program_recommendations")'));
  assert.ok(applications.includes('from("applications")'));
  assert.ok(checklist.includes('from("student_checklist_items")'));
  assert.ok(pathway.includes("determineRegulatoryPath"));
});
