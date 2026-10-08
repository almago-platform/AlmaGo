import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const queue = readFileSync("src/components/admin/AdminOrientationHumanReviewQueue.tsx", "utf8");
const page = readFileSync("src/app/admin/orientation/page.tsx", "utf8");
const api = readFileSync("src/app/api/admin/orientation/reviews/[id]/route.ts", "utf8");

test("orientation queue starts with ten pending cases per page and exposes full history", () => {
  assert.match(page, /const pageSize = 10/);
  assert.match(page, /reviewQuery\.eq\("review_status", "pending"\)/);
  assert.match(page, /\.range\(offset, offset \+ pageSize - 1\)/);
  assert.match(page, /count: "exact"/);
  assert.match(page, /reviewStatus=all/);
  assert.match(page, /reviewPage=\$\{reviewPage \+ 1\}/);
  assert.match(page, /reviewPage=\$\{reviewPage - 1\}/);
  assert.match(page, /aria-label="Pages des audits"/);
});

test("only first pending audit opens and all others can be expanded", () => {
  assert.match(queue, /reviews\.map\(\(review, index\)/);
  assert.match(queue, /open=\{index === 0 && review\.review_status === "pending"\}/);
  assert.match(queue, /Examiner et décider/);
  assert.match(queue, /Afficher les preuves détaillées \(A–D\)/);
  for (const phase of ["A — candidats découverts", "B — faits vérifiés", "C — shortlist déterministe", "D — texte généré"]) {
    assert.ok(queue.includes(phase));
  }
});

test("a single selection panel retains verification facts and safe backend constraints", () => {
  assert.match(queue, /Sélection des pistes à valider en interne/);
  assert.match(queue, /selected\.length >= 4/);
  assert.match(queue, /verification\.overallStatus !== "unknown"/);
  assert.match(queue, /\["teaching_language", "german_language_requirement", "english_language_requirement"/);
  assert.match(queue, /sourceUrl/);
  assert.match(queue, /possibleGermanGap/);
  assert.match(queue, /compatibilité linguistique avant toute validation/);
  assert.match(queue, /Le contrôle des informations publiées ne garantit pas l’admission personnelle/);
  assert.equal((queue.match(/type="checkbox"/g) || []).length, 1);
  assert.match(api, /approvedSelection\.length < 1 \|\| approvedSelection\.length > 4/);
  assert.match(api, /allowed\.has\(key\)/);
});

test("human review decisions stay internal and notes are required for corrections and rejection", () => {
  for (const label of ["Confirmer après audit", "Demander correction", "Rejeter cette revue", "workflow de publication manuel"]) {
    assert.ok(queue.includes(label));
  }
  assert.match(queue, /obligatoire pour demander une correction ou rejeter/);
  assert.match(api, /decision === "changes_requested" && !note/);
  assert.match(api, /decision === "rejected"/);
  assert.doesNotMatch(queue, /service_role|createPrivilegedSupabaseClient/);
});
