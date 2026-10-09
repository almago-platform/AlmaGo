import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const sources = {
  applications: "src/app/admin/applications/page.tsx",
  documents: "src/app/admin/documents/page.tsx",
  intake: "src/app/admin/intake/page.tsx",
  programs: "src/app/admin/programs/page.tsx",
  universities: "src/app/admin/universities/page.tsx",
  language: "src/app/admin/language-courses/page.tsx",
  finance: "src/app/admin/finance-insurance/page.tsx",
  payments: "src/app/admin/payments/page.tsx",
  offers: "src/app/admin/offers/page.tsx",
  team: "src/app/admin/team/page.tsx",
  orientation: "src/app/admin/orientation/page.tsx",
};
const read = (name) => readFileSync(sources[name], "utf8");

test("the most common admin page descriptions use direct, simple French", () => {
  for (const [name, phrase] of [
    ["applications", "Suivez les candidatures en cours"],
    ["documents", "Vérifiez la version actuelle de chaque document reçu"],
    ["programs", "Cherchez d’abord une formation"],
    ["universities", "Cherchez d’abord une université"],
    ["language", "Ajoutez uniquement des cours"],
    ["team", "Voyez qui suit chaque dossier"],
  ]) assert.ok(read(name).includes(phrase), name);
});

test("simpler guidance keeps important operational and legal distinctions", () => {
  assert.match(read("orientation"), /Une recommandation n’est pas une décision d’admission/);
  assert.match(read("intake"), /Après l’accord de l’étudiant, vérifiez le paiement et validez la suite/);
  assert.match(read("payments"), /Confirmez sa réception, puis validez séparément l’activation/);
  assert.match(read("offers"), /confirmation « Publier cette version »/);
  assert.match(read("finance"), /ne classe pas les fournisseurs et ne décide pas si un étudiant peut obtenir une aide/);
  for (const file of Object.values(sources)) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /AdminPageHeader/);
  }
});
