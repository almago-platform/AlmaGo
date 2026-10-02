import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const route = readFileSync("src/components/orientation/OrientationRouteCard.tsx", "utf8");
const routeCopy = readFileSync("src/content/orientation-route-copy.ts", "utf8");
const form = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const savedReport = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");

test("SO-V2 renders the same personalised route on the live result and saved report", () => {
  assert.match(form, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
  assert.match(savedReport, /<OrientationRouteCard answers=\{answers\} locale=\{locale\} \/>/);
});

test("SO-V2 route covers language through post-admission instead of a generic verification checklist", () => {
  for (const marker of [
    "copy.steps.language.title",
    "copy.steps.academic.title",
    "copy.steps.programs.title",
    "copy.steps.application.title",
    "copy.steps.afterAdmission.title",
  ]) {
    assert.match(route, new RegExp(marker.replaceAll(".", "\\.")));
  }

  assert.match(routeCopy, /Campus Allemagne vérifie quelle route s’applique/);
  assert.match(routeCopy, /Campus Allemagne doit comparer de vrais programmes/);
  assert.match(routeCopy, /organise les pièces, les étapes et le bon canal de candidature/);
  assert.doesNotMatch(form, /diagnostic\.paths|diagnostic\.priorities|diagnostic\.checks/);
});

test("SO-V2 assigns responsibilities to student, Campus Allemagne and official bodies", () => {
  assert.match(route, /type Owner = "student" \| "campus" \| "official"/);
  assert.match(routeCopy, /student: "Vous"/);
  assert.match(routeCopy, /campus: "Campus Allemagne"/);
  assert.match(routeCopy, /official: "Organisme officiel"/);
  assert.match(routeCopy, /Vous choisissez ensuite parmi des pistes déjà structurées/);
});

test("SO-V2 turns A2 into a concrete next language target while keeping exact programme requirements unclaimed", () => {
  assert.match(route, /A2: "B1"/);
  assert.match(route, /B1: "B2"/);
  assert.match(route, /B2: "C1"/);
  assert.match(routeCopy, /Le niveau final exigé sera confirmé programme par programme/);
});

test("SO-V2 offers Tunisia, Germany and city-flexibility alternatives without inventing partners", () => {
  assert.match(routeCopy, /Langue d’abord en Tunisie/);
  assert.match(routeCopy, /Poursuivre la langue en Allemagne/);
  assert.match(routeCopy, /Rester flexible sur la ville/);
  assert.match(routeCopy, /aucune école n’est présentée comme partenaire sans partenariat validé/);
});

test("SO-V2 has native copy for every supported locale and preserves admission/visa safeguards", () => {
  for (const locale of ["fr", "ar", "en", "de"]) {
    assert.match(routeCopy, new RegExp(`const ${locale}: OrientationRouteCopy`));
  }
  assert.doesNotMatch(
    routeCopy,
    /admission garantie|visa garanti|guaranteed admission|guaranteed visa|garantierte Zulassung|garantiertes Visum/i,
  );
  assert.match(routeCopy, /ne constitue ni une admission universitaire ni une décision de visa/);
});
