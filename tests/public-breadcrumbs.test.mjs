import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const component = readFileSync("src/components/public/PublicBreadcrumbs.tsx", "utf8");
const publicPages = [
  "src/app/aide/page.tsx",
  "src/app/comprendre-les-demarches/page.tsx",
  "src/app/selon-votre-pays/page.tsx",
  "src/app/confiance/page.tsx",
  "src/app/a-propos/page.tsx",
];

test("public breadcrumb component is accessible", () => {
  assert.match(component, /aria-label="Fil d’Ariane"/);
  assert.match(component, /aria-current="page"/);
  assert.match(component, /href="\/"/);
});

test("deep public pages expose breadcrumb navigation", () => {
  for (const page of publicPages) {
    const source = readFileSync(page, "utf8");
    assert.match(source, /PublicBreadcrumbs/);
  }
});
