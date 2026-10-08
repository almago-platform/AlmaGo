import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/page.tsx", "utf8");
const faq = readFileSync("src/components/public/HomeFaqSection.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("the outdated start-here tools block is not rendered anymore", () => {
  assert.doesNotMatch(page, /<HomeTrustSection/);
  assert.match(page, /<HomeServicesSection/);
});

test("FAQ keeps existing warm layout and includes new honest free/paid questions", () => {
  assert.match(faq, /extraQuestions/);
  assert.match(faq, /\.\.\.extraQuestions, \.\.\.faq\.items/);
  assert.match(css, /\.faq\s*\{[\s\S]*background:\s*#f7f4ec/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.faqGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
