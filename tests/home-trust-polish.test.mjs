import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const tools = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("public trust framing keeps AlmaGo independent and official decisions external", () => {
  assert.ok(nativeCopy.includes('independent: "Plateforme indépendante"'));
  assert.ok(nativeCopy.includes("uni-assist · source externe"));
  assert.ok(nativeCopy.includes("Les admissions, visas et autres décisions officielles appartiennent"));
  assert.ok(nativeCopy.includes('"Vérifier une information"'));
  assert.ok(closing.includes("footer.disclaimer"));
  assert.ok(page.includes("<HomeLanding copy={landingCopy} primaryHref={primaryHref} />"));
  assert.ok(tools.includes("tools.items.map"));
});

test("helpful tools use the current three-column desktop layout", () => {
  assert.ok(css.includes(".helpfulTools.section {"));
  assert.ok(css.includes("padding-block: 66px 58px"));
  assert.ok(css.includes("grid-template-columns: repeat(3, minmax(0, 1fr))"));
  assert.ok(css.includes("align-items: center"));
});

test("helpful tools retain responsive one-column behavior on phones", () => {
  assert.ok(css.includes("@media (max-width: 599px)"));
  assert.ok(css.includes("grid-template-columns: 1fr"));
});
