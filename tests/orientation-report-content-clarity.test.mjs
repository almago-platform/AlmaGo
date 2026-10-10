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
  assert.ok(card.includes("View criteria and items to check"));
  assert.ok(card.includes("عرض المعايير والنقاط التي يجب التحقق منها"));
  assert.ok(card.includes("Kriterien und offene Punkte anzeigen"));
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
  assert.ok(reportCopy.includes("Votre profil, des pistes d’études et les prochaines étapes à préparer."));
  assert.ok(reportCopy.includes("ملفك الدراسي، ومسارات للدراسة، والخطوات القادمة للتحضير."));
  assert.ok(reportCopy.includes("Your profile, study options and practical next steps."));
  assert.ok(reportCopy.includes("Dein Profil, mögliche Studienwege und die nächsten Schritte."));
});
