import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const people = readFileSync("src/app/admin/people/page.tsx", "utf8");
const prospects = readFileSync("src/app/admin/prospects/page.tsx", "utf8");

test("the people list prioritizes the next action without losing the secure dossier link", () => {
  assert.match(people, /Prochaine action : \$\{person\.nextAction\}/);
  assert.match(people, /text-sm leading-5 text-slate-700 sm:line-clamp-2/);
  assert.match(people, /href=\{\x60\/admin\/dossiers\/\$\{person\.userId\}\x60\}/);
  assert.match(people, /name="q"/);
  assert.match(people, /Suivi du jour/);
});

test("prospects show human review guidance while respecting existing qualification gates", () => {
  assert.match(prospects, /Situation et prochaine vérification/);
  assert.match(prospects, /canReview\s*\?\s*"Ce projet peut être examiné/);
  assert.match(prospects, /Non autorisé : ne pas contacter à des fins commerciales/);
  assert.match(prospects, /prospect\.contact_consent/);
  assert.match(prospects, /qualification\?\.state === "ready_for_review"/);
  assert.match(prospects, /accessStatus === "prospect_account"/);
  assert.match(prospects, /ProspectQualificationReviewForm/);
  assert.match(prospects, /ni une admission ni une décision automatique/);
  assert.doesNotMatch(prospects, /P2\.7 persistée|Qualification non persistée/);
});
