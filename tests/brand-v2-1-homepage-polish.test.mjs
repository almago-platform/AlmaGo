import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const config = readFileSync("next.config.ts", "utf8");

test("Brand V2.1 keeps contextual Pexels photography with transparent attribution", () => {
  assert.match(hero, /pexels-photo-7972313\.jpeg/);
  assert.match(hero, /className=\{s\.heroBackdrop\}/);
  assert.match(footer, /Photographies d’illustration/);
  assert.match(footer, /pexels\.com\/license/);
  assert.match(footer, /ne sont pas présentées comme utilisatrices d’AlmaGo/);
  assert.match(config, /hostname:\s*"images\.pexels\.com"/);
});

test("Brand V2.1 keeps the immersive hero and removes the obsolete product block from the live page", () => {
  assert.match(css, /\.hero\s*\{[\s\S]*min-height:\s*610px/);
  assert.match(css, /\.heroBackdrop\s*\{[\s\S]*position:\s*absolute/);
  assert.match(css, /\.heroImmersiveInner\s*\{[\s\S]*min-height:\s*610px/);
  assert.match(page, /HomePhotoBand/);
  assert.doesNotMatch(page, /HomeProduct/);
});
