import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const publicForm = readFileSync("src/components/orientation/PublicOrientationForm.tsx", "utf8");
const reportPage = readFileSync("src/app/orientation/report/[token]/page.tsx", "utf8");

test("orientation PDF helper text uses AA-safe foreground on subtle surfaces", () => {
  for (const source of [publicForm, reportPage]) {
    assert.match(
      source,
      /text-xs leading-5 text-\[var\(--foreground\)\]">\{prospectCopy\.report\.printHelp\}/,
    );
    assert.doesNotMatch(
      source,
      /text-xs leading-5 text-\[var\(--muted\)\]">\{prospectCopy\.report\.printHelp\}/,
    );
  }
});


test("Smart result disclaimer and diagnostic headline use AA-safe foreground text", () => {
  const smartCard = readFileSync("src/components/orientation/SmartOrientationResultCard.tsx", "utf8");
  assert.match(
    smartCard,
    /text-xs leading-5 text-\[var\(--foreground\)\][^>]*>\s*\{copy\.disclaimer\}/,
  );
  assert.doesNotMatch(
    smartCard,
    /text-xs leading-5 text-\[var\(--muted\)\][^>]*>\s*\{copy\.disclaimer\}/,
  );

  for (const source of [publicForm, reportPage]) {
    assert.match(
      source,
      /text-sm leading-6 text-\[var\(--foreground\)\][^>]*>\s*\{diagnosticCopy\.headlines\[/,
    );
  }
});
