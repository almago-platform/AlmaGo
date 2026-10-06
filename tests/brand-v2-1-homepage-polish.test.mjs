import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const hero = readFileSync("src/components/public/HomeHero.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const nativeCopy = readFileSync("src/content/native-copy.ts", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
const config = readFileSync("next.config.ts", "utf8");

test("Brand V2.1 keeps contextual Pexels photography with transparent attribution", () => {
  assert.ok(hero.includes("pexels-photo-7972313.jpeg"));
  assert.ok(hero.includes("className={s.heroBackdrop}"));
  assert.ok(nativeCopy.includes("Photographies d’illustration"));
  assert.ok(footer.includes("pexels.com/license"));
  assert.ok(nativeCopy.includes("ne sont pas présentées comme utilisatrices d’AlmaGo"));
  assert.ok(config.includes('hostname: "images.pexels.com"'));
});

test("Brand V2.1 keeps the immersive hero while the current homepage surfaces the product preview", () => {
  assert.ok(css.includes(".hero {"));
  assert.ok(css.includes("min-height: 610px"));
  assert.ok(css.includes(".heroBackdrop {"));
  assert.ok(css.includes("position: absolute"));
  assert.ok(css.includes(".heroImmersiveInner {"));
  assert.ok(page.includes("HomeProductPreview"));
  assert.ok(page.includes("HomePhotoBand"));
});
