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

test("SO-V3 gives the Tunisia Sciences techniques test profile a concrete academic access conclusion", () => {
  assert.match(catalogue, /answers\.bacTrack === "Sciences techniques"/);
  assert.match(catalogue, /Accès direct possible en ingénierie/);
  assert.match(catalogue, /direct lié au domaine à tous les domaines sauf les sciences humaines/);
  assert.match(catalogue, /ad-layerId=4640/);
});

test("SO-V3 shows verified Aachen engineering examples from RWTH and FH Aachen", () => {
  assert.match(catalogue, /RWTH Aachen University/);
  assert.match(catalogue, /Elektrotechnik und Informationstechnik/);
  assert.match(catalogue, /FH Aachen/);
  assert.match(catalogue, /Elektrotechnik/);
  assert.match(catalogue, /Maschinenbau/);
  assert.match(catalogue, /verifiedAt: "2026-10-02"/);
});

test("SO-V3 keeps language route concrete without inventing a Campus Allemagne school partner", () => {
  assert.match(report, /A2/);
  assert.match(report, /B1/);
  assert.match(report, /B2\/C1/);
  assert.match(report, /Une école ne sera appelée « partenaire Campus Allemagne » qu'après accord réel signé/);
  assert.doesNotMatch(catalogue, /partner|partenaire/i);
});

test("SO-V3 preserves final authority boundaries", () => {
  assert.match(report, /la décision d'admission appartient à chaque université/);
  assert.match(report, /la décision de visa aux autorités compétentes/);
});
