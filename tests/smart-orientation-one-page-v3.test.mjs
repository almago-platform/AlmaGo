import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const report = readFileSync("src/components/orientation/OrientationOnePagePrintReport.tsx", "utf8");
const catalogue = readFileSync("src/lib/orientation/verified-academic-options.ts", "utf8");
const css = readFileSync("src/app/globals.css", "utf8");

test("SO-V3 print output is a dedicated one-page report instead of printing the rich web route", () => {
  assert.match(report, /orientation-one-page-print/);
  assert.match(css, /\.orientation-screen-report \{[\s\S]*display: none !important/);
  assert.match(css, /@page \{[\s\S]*size: A4;[\s\S]*margin: 10mm/);
  assert.match(css, /\.orientation-one-page-table/);
});

test("SO-V3.1 has an explicit Tunisian Bac access rule for every track exposed by the form", () => {
  for (const track of [
    "Sciences expérimentales",
    "Mathématiques",
    "Sciences techniques",
    "Économie et gestion",
    "Lettres",
    "Informatique",
    "Sport",
    "other",
  ]) {
    assert.ok(catalogue.includes(track), `missing Tunisian Bac rule for ${track}`);
  }

  assert.match(catalogue, /"Sciences expérimentales": \{[\s\S]*?status: "verified"/);
  assert.match(catalogue, /"Sciences techniques": \{[\s\S]*?status: "verified"/);
  assert.match(catalogue, /Lettres: \{[\s\S]*?status: "verified"/);
  assert.match(catalogue, /Sport: \{[\s\S]*?status: "needs_human_verification"/);
  assert.match(catalogue, /Campus Allemagne vérifie votre accès/);
  assert.match(catalogue, /ad-layerId=4640/);
  assert.match(catalogue, /ad-layerId=4016/);
});

test("SO-V3 shows verified Aachen engineering examples from RWTH and FH Aachen", () => {
  assert.match(catalogue, /RWTH Aachen University/);
  assert.match(catalogue, /Elektrotechnik und Informationstechnik/);
  assert.match(catalogue, /FH Aachen/);
  assert.match(catalogue, /Elektrotechnik/);
  assert.match(catalogue, /Maschinenbau/);
  assert.match(catalogue, /verifiedAt: "2026-10-02"/);
});

test("SO-V3.1 makes the language route concrete and only mentions partners conditionally", () => {
  assert.match(report, /A2/);
  assert.match(report, /B1/);
  assert.match(report, /B2\/C1/);
  assert.match(report, /Selon les disponibilités de votre parcours/);
  assert.match(report, /école partenaire validée/);
  assert.doesNotMatch(catalogue, /partner|partenaire/i);
});

test("SO-V3.1 communicates end-to-end support while preserving authority boundaries", () => {
  assert.match(report, /prend en charge l'accompagnement opérationnel de votre projet/);
  assert.match(report, /organisation et suivi des candidatures/);
  assert.match(report, /préparation de votre arrivée en Allemagne/);
  assert.match(report, /services d'intégration et de carrière disponibles/);
  assert.match(report, /Si vous choisissez de continuer, Campus Allemagne vous contacte/);
  assert.match(report, /la décision d'admission appartient à chaque université/);
  assert.match(report, /la décision de visa aux autorités compétentes/);
});

test("SO-V3.1 recommends Aachen engineering options when no city is fixed and labels the suggestion honestly", () => {
  assert.match(catalogue, /answers\.preferredCities\.length === 0/);
  assert.match(catalogue, /selectionReason: "recommended_city"/);
  assert.match(report, /Suggestion Campus Allemagne/);
  assert.match(report, /Ville à définir/);
});
