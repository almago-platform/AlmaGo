import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const header = read("src/components/public/HomeHeader.tsx");
const about = read("src/components/public/HomeAboutSection.tsx");
const services = read("src/components/public/HomeServicesSection.tsx");
const copy = read("src/content/homepage-v42-copy.ts");
const css = read("src/components/public/Homepage.module.css");

test("V4.2 presents who we are, what is different and what is offered", () => {
  assert.match(page, /<HomeAboutSection/);
  assert.match(page, /<HomeServicesSection/);
  assert.match(about, /copy\.mission/);
  assert.match(about, /copy\.values\.map/);
  assert.match(services, /copy\.options\.map/);
});

test("navigation links to actual V4.2 destinations, including mobile", () => {
  assert.match(header, /\[marketingNav\.about, "#apropos"\]/);
  assert.match(header, /\[marketingNav\.services, "#services"\]/);
  assert.match(header, /\[marketingNav\.contact, "\/contact"\]/);
  assert.match(about, /id="apropos"/);
  assert.match(services, /id="services"/);
  assert.equal((header.match(/navigation\.map/g) || []).length, 2);
});

test("new cards support responsive layouts and the brand copy is localized", () => {
  assert.match(css, /\.v42Values\s*\{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /\.v42ServiceGrid\s*\{[\s\S]*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.v42ServiceGrid\s*\{ grid-template-columns: 1fr/);
  for (const locale of ["fr", "ar", "en", "de"]) assert.match(copy, new RegExp("^  " + locale + ": \\{", "m"));
});
