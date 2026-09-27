import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const config = readFileSync("next.config.ts", "utf8");

test("Brand V2.1 uses contextual Pexels campus photography", () => {
  assert.match(hero, /pexels-photo-7683694\.jpeg/);
  assert.match(hero, /bâtiment universitaire moderne/);
  assert.match(footer, /college-students-in-a-university-campus-7683694/);
  assert.match(config, /hostname:\s*"images\.pexels\.com"/);
});

test("Brand V2.1 reduces visual competition and product whitespace", () => {
  assert.match(css, /\.utility\s*\{[\s\S]*background:\s*#1c2124/);
  assert.match(css, /\.product\.section\s*\{[\s\S]*padding-block:\s*72px/);
  assert.match(css, /min-height:\s*404px/);
  assert.match(css, /border-bottom-color:\s*#db0423/);
});
