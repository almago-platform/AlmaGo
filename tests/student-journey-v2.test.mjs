import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/student/StudentJourneyHeader.tsx", "utf8");
const pages = [
  ["project", "src/app/student/project/page.tsx"],
  ["documents", "src/app/student/documents/page.tsx"],
  ["orientation", "src/app/student/orientation/page.tsx"],
  ["checklist", "src/app/student/checklist/page.tsx"],
  ["applications", "src/app/student/applications/page.tsx"],
  ["pathway", "src/app/student/pathway/page.tsx"],
];

test("student journey header exposes the six core dossier steps", () => {
  assert.match(header, /Mon projet/);
  assert.match(header, /Documents/);
  assert.match(header, /Programmes/);
  assert.match(header, /Démarches/);
  assert.match(header, /Candidatures/);
  assert.match(header, /label: "Parcours"/);
  assert.match(header, /aria-label="Étapes de mon dossier"/);
  assert.match(header, /aria-current=/);
});

test("core student journey pages use the shared journey header", () => {
  for (const [key, path] of pages) {
    const source = readFileSync(path, "utf8");
    assert.match(source, /StudentJourneyHeader/);
    assert.match(source, new RegExp(`current="${key}"`));
    assert.match(source, /max-w-7xl px-4 py-5/);
  }
});

test("student journey redesign does not alter data sources", () => {
  const documents = readFileSync("src/app/student/documents/page.tsx", "utf8");
  const orientation = readFileSync("src/app/student/orientation/page.tsx", "utf8");
  const applications = readFileSync("src/app/student/applications/page.tsx", "utf8");
  const checklist = readFileSync("src/app/student/checklist/page.tsx", "utf8");
  const pathway = readFileSync("src/app/student/pathway/page.tsx", "utf8");

  assert.match(documents, /from\("documents"\)/);
  assert.match(orientation, /from\("program_recommendations"\)/);
  assert.match(applications, /from\("applications"\)/);
  assert.match(checklist, /from\("student_checklist_items"\)/);
  assert.match(pathway, /determineRegulatoryPath/);
});
