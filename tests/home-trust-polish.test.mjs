import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const trust = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("trust section keeps AlmaGo independence and external-source framing", () => {
  assert.match(trust, /AlmaGo est une plateforme indépendante/);
  assert.match(trust, /Référence externe, sans affiliation à AlmaGo/);
  assert.match(trust, /https:\/\/www\.uni-assist\.de\/en\//);
});

test("trust section uses compact aligned desktop layout", () => {
  assert.match(css, /\.trust\.section\s*\{[\s\S]*padding-block:\s*58px 62px/);
  assert.match(css, /\.trustGrid\s*\{[\s\S]*grid-template-columns:\s*minmax\(0, 0\.92fr\) minmax\(0, 1\.08fr\)/);
  assert.match(css, /\.sourceCard\s*\{[\s\S]*padding:\s*24px 28px 25px/);
});

test("trust section retains responsive one-column behavior", () => {
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.trustGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
