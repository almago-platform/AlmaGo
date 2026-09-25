import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const universities = readFileSync("src/components/admin/AdminUniversitiesPanel.tsx", "utf8");
const programs = readFileSync("src/components/admin/AdminProgramsPanel.tsx", "utf8");

test("catalogue admin surfaces known fixture filters without changing data automatically", () => {
  for (const source of [universities, programs]) {
    assert.match(source, /isKnownCatalogueFixtureName/);
    assert.match(source, /"known_fixture"/);
    assert.match(source, /Données de test connues/);
    assert.match(source, /Donnée de test connue/);
    assert.match(source, /Données de test actives/);
  }
});

test("known fixture counts are limited to currently active catalogue records", () => {
  assert.match(universities, /activeUniversities\.filter\([\s\S]*?isKnownCatalogueFixtureName\(university\.name\)/);
  assert.match(programs, /activePrograms\.filter\([\s\S]*?isKnownCatalogueFixtureName\(program\.name\)/);
});

test("known fixture filter keeps deactivated historical fixtures reviewable", () => {
  const universityFilter = universities.slice(
    universities.indexOf("const filtered = useMemo"),
    universities.indexOf("function change"),
  );
  const programFilter = programs.slice(
    programs.indexOf("const filtered = useMemo"),
    programs.indexOf("function change"),
  );

  assert.match(universityFilter, /quality === "known_fixture" && !isKnownCatalogueFixtureName\(university\.name\)/);
  assert.match(programFilter, /quality === "known_fixture" && !isKnownCatalogueFixtureName\(program\.name\)/);
  assert.doesNotMatch(universityFilter, /university\.is_active/);
  assert.doesNotMatch(programFilter, /program\.is_active/);
});

test("cleanup remains an explicit per-record action", () => {
  for (const source of [universities, programs]) {
    assert.match(source, /async function toggleActive/);
    assert.match(source, /\? "Désactiver"\s*: "Réactiver"/);
    assert.doesNotMatch(source, /Promise\.all\([^)]*toggleActive/s);
    assert.doesNotMatch(source, /Désactiver toutes/i);
  }
});
