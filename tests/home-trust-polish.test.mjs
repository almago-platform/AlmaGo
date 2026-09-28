import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tools = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("public trust framing keeps AlmaGo independent and official decisions external", () => {
  assert.match(nativeCopy, /independent: "Plateforme indépendante"/);
  assert.match(nativeCopy, /uni-assist · source externe/);
  assert.match(nativeCopy, /Les admissions, visas et autres décisions officielles appartiennent/);
  assert.match(nativeCopy, /"Vérifier une information"/);
  assert.match(closing, /footer.disclaimer/);
  assert.match(tools, /copy.home.tools/);
});

test("helpful tools use the current three-column desktop layout", () => {
  assert.match(css, /.helpfulTools.sections*{[sS]*padding-block:s*66px 58px/);
  assert.match(css, /.helpfulToolsGrids*{[sS]*grid-template-columns:s*repeat(3, minmax(0, 1fr))/);
  assert.match(css, /.helpfulToolCards*{[sS]*align-items:s*center/);
});

test("helpful tools retain responsive one-column behavior on phones", () => {
  assert.match(css, /@media (max-width: 599px)[sS]*.helpfulToolsGrids*{[sS]*grid-template-columns:s*1fr/);
});
