import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const toolsSection = readFileSync("src/components/public/HomeTrustSection.tsx", "utf8");
const css = readFileSync("src/components/public/Homepage.module.css", "utf8");

test("helpful tools no longer render the isolated footer note", () => {
  assert.doesNotMatch(toolsSection, /AlmaGo organise votre préparation/);
  assert.doesNotMatch(toolsSection, /helpfulToolsNote/);
});

test("tools and FAQ use compact desktop spacing", () => {
  assert.match(css, /\.helpfulTools\.section\s*\{[\s\S]*padding-block:\s*50px 38px/);
  assert.match(css, /\.helpfulToolsHeading\s*\{[\s\S]*margin-bottom:\s*28px/);
  assert.match(css, /\.faq\.section\s*\{[\s\S]*padding-block:\s*50px 56px/);
  assert.match(css, /\.faqGrid\s*\{[\s\S]*gap:\s*58px/);
});

test("FAQ uses a subtle warm background and keeps responsive stacking", () => {
  assert.match(css, /\.faq\s*\{[\s\S]*background:\s*#f7f4ec/);
  assert.match(css, /@media \(max-width: 899px\)[\s\S]*\.faqGrid\s*\{[\s\S]*grid-template-columns:\s*1fr/);
});
