import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/contact/page.tsx", "utf8");
const copy = readFileSync("src/content/native-copy.ts", "utf8");

test("public contact route uses only the confirmed Campus Allemagne email", () => {
  assert.match(page, /contact@campus-allemagne\.info/);
  assert.match(page, /mailto:contact@campus-allemagne\.info/);
  assert.doesNotMatch(page, /tel:/);
  assert.doesNotMatch(page, /<form/);
});

test("contact route keeps a dedicated canonical URL", () => {
  assert.match(page, /new URL\("\/contact", publicOrigin\)/);
  assert.match(page, /const indexingEnabled = isPublicIndexingEnabled\(\)/);
  assert.match(page, /index: indexingEnabled/);
  assert.match(page, /follow: indexingEnabled/);
});

test("all four public footer locales expose the contact route", () => {
  assert.equal((copy.match(/"\/contact"/g) || []).length, 4);
  assert.match(copy, /\["Contact", "\/contact"\]/);
  assert.match(copy, /\["تواصل معنا", "\/contact"\]/);
  assert.match(copy, /\["Kontakt", "\/contact"\]/);
});

test("contact route reuses the approved public brand and footer", () => {
  assert.match(page, /BrandLogo/);
  assert.match(page, /HomeFooter/);
  assert.match(page, /rebrandCopy\(getNativeCopy\(locale\)\)/);
});

test("contact footer follows the Phase 2 orientation funnel when enabled", () => {
  assert.match(page, /const phase2Enabled = isPhase2AccessEnabled\(\)/);
  assert.match(page, /<HomeFooter[\s\S]*phase2Enabled=\{phase2Enabled\}/);
  assert.match(page, /orientationLabel=\{copy\.home\.nav\.orientation\}/);
});

test("contact page keeps an independent, high-contrast shared footer", () => {
  const css = readFileSync("src/components/public/Homepage.module.css", "utf8");
  const contactCss = readFileSync("src/app/contact/ContactPage.module.css", "utf8");
  const sharedFooter = readFileSync("src/components/public/HomeClosing.tsx", "utf8");

  assert.match(css, /\.footer\s*\{[\s\S]*?--home-cream:\s*#f7f4ec/);
  assert.match(css, /\.footer\s*\{[\s\S]*?--home-ink:\s*#1c2124/);
  assert.match(css, /\.footer li a\s*\{[\s\S]*?color:\s*#f7f4ec|\.footer li a\s*\{[\s\S]*?color:\s*var\(--home-cream\)/);
  assert.match(css, /\.footerLogoLink\s*\{[\s\S]*?background:\s*var\(--home-cream\)/);
  assert.match(page, /brandFooter=\{homepageV42Copy\[locale\]\.footer\}/);
  assert.match(page, /hashLinksToHome/);
  assert.match(sharedFooter, /hashLinksToHome && href\.startsWith\("#"\) \? `\/\$\{href\}` : href/);
  assert.match(contactCss, /\.hero h1\s*\{[\s\S]*?font-size:\s*clamp\(2\.65rem, 5\.6vw, 4\.4rem\)/);
});

test("contact safety copy remains simple and never asks for passwords or attachments", () => {
  assert.match(page, /Protégez vos informations/);
  assert.match(page, /Ne nous envoyez jamais votre mot de passe par e-mail/);
  assert.match(page, /utilisez votre espace étudiant si cette option est disponible/);
  assert.doesNotMatch(page, /privilégiez votre espace étudiant lorsque cela suffit/);
});
