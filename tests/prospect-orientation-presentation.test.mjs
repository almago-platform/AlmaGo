import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const presentation = readFileSync(
  "src/lib/prospect/orientation-presentation.ts",
  "utf8",
);
const dashboard = readFileSync("src/app/prospect/page.tsx", "utf8");
const orientation = readFileSync(
  "src/app/prospect/orientation/page.tsx",
  "utf8",
);

test("prospect summaries expose localized engineering and science specialties", () => {
  assert.match(presentation, /answers\.targetField === "Ingénierie"/);
  assert.match(presentation, /answers\.engineeringSpecialty/);
  assert.match(presentation, /engineeringSpecialtyOptions/);
  assert.match(presentation, /answers\.targetField === "Sciences"/);
  assert.match(presentation, /answers\.scienceSpecialty/);
  assert.match(presentation, /scienceSpecialtyOptions/);
  assert.match(presentation, /localizeProfileOptions/);
  assert.match(presentation, /localizePreferredCity/);
});

test("dashboard and orientation cards both use the richer project facts", () => {
  assert.match(dashboard, /orientationProjectFacts\(state\.answers, locale\)/);
  assert.match(orientation, /orientationProjectFacts\(state\.answers, locale\)/);
});

test("orientation history identifies versions by their actual project choices", () => {
  assert.match(
    presentation,
    /orientationVersionSummary[\s\S]*degree[\s\S]*specialty[\s\S]*field[\s\S]*cities/,
  );
  assert.match(
    dashboard,
    /orientationVersionSummary\(orientation\.answers, locale\)/,
  );
  assert.match(
    orientation,
    /orientationVersionSummary\(orientation\.answers, locale\)/,
  );
});
