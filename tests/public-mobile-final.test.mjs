import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("mobile navigation closes after signup tap", () => {
  assert.match(header, /mobileSignup[^>]*href="\/signup"[^>]*onClick=\{\(\) => setOpen\(false\)\}/);
});

test("phone layout prevents horizontal overflow and uses compact header", () => {
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.home\s*\{[\s\S]*overflow-x:\s*clip/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.headerInner\s*\{[\s\S]*min-height:\s*64px/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.login,[\s\S]*\.headerCta\s*\{[\s\S]*display:\s*none/);
});

test("phone hero flows naturally and dossier is not absolutely overlaid", () => {
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.hero\s*\{[\s\S]*min-height:\s*0/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.hero \.heroDossier\s*\{[\s\S]*position:\s*relative/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.heroActions \.button\s*\{[\s\S]*width:\s*100%/);
});

test("phone content uses touch-friendly single-column and swipe patterns", () => {
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.quickLinks\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.photoBandGrid\s*\{[\s\S]*scroll-snap-type:\s*x mandatory/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.steps\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.helpfulToolsGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*\.faqGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});

test("390px and smaller widths have dedicated typography and footer fallbacks", () => {
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*\.hero h1\s*\{[\s\S]*font-size:\s*41px/);
  assert.match(css, /@media \(max-width: 390px\)[\s\S]*\.footerGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(css, /@media \(max-width: 359px\)[\s\S]*\.container\s*\{[\s\S]*width:\s*calc\(100% - 24px\)/);
});
