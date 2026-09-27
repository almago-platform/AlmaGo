import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const config = readFileSync("next.config.ts", "utf8");

test("homepage V5 uses the original high-resolution campus source", () => {
  assert.match(hero, /photos\/7683694\/pexels-photo-7683694\.jpeg"/);
  assert.doesNotMatch(hero, /w=1600/);
  assert.match(hero, /quality=\{90\}/);
  assert.match(config, /qualities:\s*\[75, 90\]/);
});

test("homepage V5 increases desktop density and image presence", () => {
  assert.match(css, /width:\s*min\(1420px, calc\(100% - 72px\)\)/);
  assert.match(css, /grid-template-columns:\s*minmax\(0, 0\.84fr\) minmax\(0, 1\.16fr\)/);
  assert.match(css, /height:\s*590px/);
  assert.match(css, /padding:\s*28px 0 38px/);
  assert.match(css, /\.product\.section\s*\{[\s\S]*padding-block:\s*58px/);
});

test("homepage V5 retains responsive single-column hero behavior", () => {
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.heroGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.hero\s*\{[\s\S]*background:\s*var\(--home-cream\)/);
});
