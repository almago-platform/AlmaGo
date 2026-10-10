import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const card = read("src/components/orientation/PersonalizedOrientationEngineCard.tsx");
const reportCopy = read("src/content/orientation-prospect-copy.ts");

test("priority actions are numbered once, semantically and visibly", () => {
  assert.match(card, /<ol className="mt-2 list-decimal space-y-2 ps-6/);
  assert.match(card, /priorityActionCodes\.map\(\(code\) =>/);
  assert.match(card, /<li key=\{code\} className="ps-1">/);
  assert.doesNotMatch(card, /<strong>\{index \+ 1\}\.\<\/strong>/);
});

test("evidence section does not claim missing admissions, language or deadlines are verified", () => {
  assert.ok(card.includes("Comprendre notre analyse en détail"));
  assert.ok(card.includes("Explore our detailed analysis"));
  assert.ok(card.includes("اكتشف تفاصيل تحليلنا"));
  assert.ok(card.includes("Unsere Analyse im Detail ansehen"));
  assert.ok(card.includes("Date limite de candidature"));
  assert.ok(card.includes("Application deadline"));
  assert.ok(card.includes("آخر موعد للتقديم"));
  assert.ok(card.includes("Bewerbungsfrist"));
  assert.ok(card.includes("Le certificat accepté reste à vérifier."));
  assert.ok(card.includes("The accepted certificate still needs checking."));
  assert.match(card, /deadlineRule/);
  assert.match(card, /t\.deadlineUnknown/);
  assert.match(card, /recommendation\.missingInformation/);
  assert.match(card, /recommendation\.warnings/);
  assert.match(card, /recommendation\.sources/);
});

test("report subtitle explains what the candidate actually receives in all four languages", () => {
  assert.ok(reportCopy.includes("Votre projet, des formations à découvrir et la suite avec Campus Allemagne."));
  assert.ok(reportCopy.includes("مشروعك الدراسي، وبرامج يمكنك اكتشافها، والخطوة التالية مع Campus Allemagne."));
  assert.ok(reportCopy.includes("Your study plans, programmes to explore and how Campus Allemagne can help."));
  assert.ok(reportCopy.includes("Dein Studienwunsch, mögliche Studiengänge und deine nächsten Schritte mit Campus Allemagne."));
});
