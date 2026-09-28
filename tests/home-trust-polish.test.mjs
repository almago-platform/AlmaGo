import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const tools = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const closing = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("public trust framing keeps AlmaGo independent and official decisions external", () => {
  assert.match(closing, /Plateforme indépendante/);
  assert.match(closing, /uni-assist · source externe/);
  assert.match(closing, /Les admissions, visas et autres décisions officielles appartiennent/);
  assert.match(tools, /Vérifier une information/);
});

test("helpful tools use the current three-column desktop layout", () => {
  assert.match(css, /\.helpfulTools\.section\s*\{[\s\S]*padding-block:\s*66px 58px/);
  assert.match(css, /\.helpfulToolsGrid\s*\{[\s\S]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.helpfulToolCard\s*\{[\s\S]*align-items:\s*center/);
});

test("helpful tools retain responsive one-column behavior on phones", () => {
  assert.match(css, /@media \(max-width: 599px\)[\s\S]*\.helpfulToolsGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
