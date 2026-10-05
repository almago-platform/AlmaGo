import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const globals = fs.readFileSync("src/app/globals.css", "utf8");
const designSystem = fs.readFileSync("src/app/design-system.css", "utf8");

test("shared muted token keeps WCAG AA contrast across loaded root styles", () => {
  assert.match(globals, /--muted:\s*#62676a;/i);
  assert.match(designSystem, /--muted:\s*#62676a;/i);
  assert.doesNotMatch(designSystem, /--muted:\s*#6b6f72;/i);
});
