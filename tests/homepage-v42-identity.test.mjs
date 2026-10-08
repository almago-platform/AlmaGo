import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const page = read("src/app/page.tsx");
const header = read("src/components/public/HomeHeader.tsx");
const demo = read("src/components/public/HomeExperiencePreview.tsx");
const copy = read("src/content/homepage-v42-copy.ts");
const css = read("src/components/public/Homepage.module.css");
const legal = read("src/content/legal-content.ts");

test("V4.2 public story flows from identity to journey to experience to services and FAQ", () => {
  const sections = ["<HomeHero", "<HomeAboutSection", "<HomeJourneySection", "<HomeExperiencePreview", "<HomeServicesSection", "<HomeFaqSection"];
  for (let i = 1; i < sections.length; i++) {
    assert.ok(page.indexOf(sections[i - 1]) < page.indexOf(sections[i]), `Expected ${sections[i]} after ${sections[i - 1]}`);
  }
  assert.doesNotMatch(page, /<HomeProductPreview|<HomeTrustSection|<HomePhotoBand/);
  assert.match(page, /brandFooter=\{v42\.footer\}/);
});

test("public product demonstration correctly separates free and activated-client features", () => {
  assert.match(demo, /copy\.freeItems/);
  assert.match(demo, /copy\.clientItems/);
  assert.match(demo, /role="tablist"/);
  assert.match(demo, /role="tabpanel"/);
  assert.match(demo, /aria-selected=\{selected\}/);
  assert.match(demo, /event\.key === "Home"/);
  assert.match(demo, /event\.key === "End"/);
  assert.match(demo, /rtl \? "ArrowLeft" : "ArrowRight"/);
  assert.match(copy, /L’inscription gratuite n’active pas automatiquement les services payants/);
  assert.match(copy, /L’accès client dépend de la proposition acceptée, du paiement et de sa validation/);
});

test("brand copy is available in French Arabic English and German", () => {
  for (const locale of ["fr", "ar", "en", "de"]) assert.match(copy, new RegExp("^  " + locale + ": \\{", "m"));
  assert.match(copy, /من نحن/);
  assert.match(copy, /Über uns/);
  assert.match(copy, /About us/);
  assert.match(copy, /À propos/);
  assert.match(header, /homepageV42Copy\[locale\]\.nav/);
});

test("marketing trust framing does not claim authority or guarantee results", () => {
  assert.match(copy, /plateforme indépendante/);
  assert.match(copy, /ne garantit ni admission ni visa/);
  assert.match(legal, /a38ReviewReady: boolean = false/);
});

test("responsive sections and accessible tabs are designed for small screens and RTL", () => {
  assert.match(css, /@media \(max-width: 599px\)/);
  assert.match(css, /\.v42FeatureGrid \{ grid-template-columns: 1fr/);
  assert.match(css, /\.v42Tablist button:focus-visible/);
  assert.match(css, /:global\(html\[dir="rtl"\]\) \.v42PanelAction svg/);
});
