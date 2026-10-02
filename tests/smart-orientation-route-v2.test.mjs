import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/components/orientation/OrientationRouteCard.tsx", "utf8");
const routeCopy = readFileSync("src/content/orientation-route-copy.ts", "utf8");
const guidance = readFileSync("src/lib/orientation/universal-guidance.ts", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const savedReport = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");

test("SO-V2 renders the same personalised route on the live result and saved report", () => {
  assert.match(form, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
  assert.match(savedReport, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
});

test("SO-V3.5 route covers priority through post-admission instead of a generic checklist", () => {
  for (const marker of [
    "guidance.priorityTitle",
    "guidance.academicTitle",
    "guidance.cityTitle",
    "guidance.parallelTitle",
    "guidance.timeline.afterAdmission",
  ]) {
    assert.match(route, new RegExp(marker.replaceAll(".", "\\.")));
  }

  assert.match(guidance, /Campus Allemagne vérifie 2 ou 3 établissements réellement adaptés/);
  assert.match(guidance, /envoyer les candidatures par le canal officiel/);
  assert.match(guidance, /Après une admission : financement, assurance, visa/);
  assert.doesNotMatch(form, /diagnostic\.paths|diagnostic\.priorities|diagnostic\.checks/);
});

test("SO-V3.5 keeps responsibilities and official-decision boundaries understandable", () => {
  assert.match(guidance, /Campus Allemagne prépare avec vous/);
  assert.match(guidance, /Votre dossier avance pendant votre progression linguistique/);
  assert.match(guidance, /La décision finale appartient à l’établissement/);
  assert.match(routeCopy, /ne constitue ni une admission universitaire ni une décision de visa/);
});

test("SO-V3.5 turns A2 into B1 and keeps exact programme language requirements programme-specific", () => {
  assert.match(guidance, /A2: "B1"/);
  assert.match(guidance, /B1: "B2"/);
  assert.match(guidance, /B2: "C1"/);
  assert.match(guidance, /niveau exact demandé par les programmes retenus/);
});

test("SO-V3.5 offers Tunisia, online and Germany without inventing a partner", () => {
  assert.match(guidance, /Tunisie : continuer l’allemand sur place/);
  assert.match(guidance, /En ligne : suivre une préparation à distance avec Campus Allemagne lorsqu’elle est disponible/);
  assert.match(guidance, /Allemagne : étudier une préparation linguistique sur place avec une école partenaire validée/);
  assert.match(guidance, /uniquement si un partenariat validé est disponible/);
});

test("SO-V3.5 has native copy for every supported locale and preserves admission/visa safeguards", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(guidance, new RegExp(`${locale}: `));
  }
  assert.doesNotMatch(
    guidance,
    /admission garantie|visa garanti|guaranteed admission|guaranteed visa|garantierte Zulassung|garantiertes Visum/i,
  );
  assert.match(routeCopy, /ne constitue ni une admission universitaire ni une décision de visa/);
});
