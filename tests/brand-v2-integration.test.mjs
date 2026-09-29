import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const manifest = readFileSync("src/app/manifest.ts", "utf8");
const logo = readFileSync("public/brand/campus-allemagne-logo.svg", "utf8");
const reverse = readFileSync("public/brand/campus-allemagne-logo-reverse.svg", "utf8");
const symbol = readFileSync("public/brand/campus-allemagne-symbol.svg", "utf8");
const brand = readFileSync("src/lib/brand.ts", "utf8");
const provider = readFileSync("src/components/i18n/LocaleProvider.tsx", "utf8");

test("Campus Allemagne keeps the approved shared application palette", () => {
  assert.match(globals, /--foreground:\s*#1c2124/i);
  assert.match(globals, /--brand:\s*#db0423/i);
  assert.match(globals, /--accent:\s*#fcb50a/i);
  assert.match(globals, /--background:\s*#f7f4ec/i);
});

test("brand typography loads a unified Latin sans and native Arabic fonts", () => {
  assert.match(layout, /Inter, Noto_Kufi_Arabic, Noto_Sans_Arabic/);
  assert.doesNotMatch(layout, /Source_Serif_4/);
  assert.doesNotMatch(layout, /--font-source-serif/);
  assert.match(layout, /--font-arabic/);
  assert.match(layout, /--font-arabic-display/);
});

test("Campus Allemagne is the canonical logo across public and authenticated shells", () => {
  assert.match(header, /BrandLogo/);
  assert.match(footer, /variant="reverse"/);
  assert.match(shell, /BrandLogo/);
  assert.match(logo, /Campus Allemagne/);
  assert.match(logo, /#1C2124/i);
  assert.match(logo, /#DB0423/i);
  assert.match(logo, /#FCB50A/i);
  assert.match(reverse, /#FFFFFF/);
  assert.match(symbol, /viewBox="0 0 520 420"/);
});

test("localized public copy is rebranded without rewriting locale source files", () => {
  assert.match(brand, /BRAND_NAME = "Campus Allemagne"/);
  assert.match(brand, /LEGACY_BRAND_NAME = "AlmaGo"/);
  assert.match(provider, /rebrandCopy\(getNativeCopy\(locale\)\)/);
  assert.match(footer, /© Campus Allemagne/);
});

test("metadata, favicon and PWA manifest use Campus Allemagne", () => {
  const icon = readFileSync("src/app/icon.svg", "utf8");
  assert.match(layout, /applicationName: BRAND_NAME/);
  assert.match(layout, /siteName: BRAND_NAME/);
  assert.match(layout, /campus-allemagne-symbol\.svg/);
  assert.match(manifest, /name: "Campus Allemagne"/);
  assert.match(manifest, /campus-allemagne-symbol\.svg/);
  assert.match(icon, /Campus Allemagne/);
});
