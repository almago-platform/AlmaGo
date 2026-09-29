import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/globals.css", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const header = readFileSync("src/components/public/HomeHeader.tsx", "utf8");
const footer = readFileSync("src/components/public/HomeClosing.tsx", "utf8");
const shell = readFileSync("src/components/layout/AppShell.tsx", "utf8");
const manifest = readFileSync("src/app/manifest.ts", "utf8");
const brandLogo = readFileSync("src/components/brand/BrandLogo.tsx", "utf8");
const brand = readFileSync("src/lib/brand.ts", "utf8");
const provider = readFileSync("src/components/i18n/LocaleProvider.tsx", "utf8");

const approvedLogo = "public/brand/campus-allemagne-logo-approved.png";
const approvedSymbol = "public/brand/campus-allemagne-symbol-approved.png";
const approvedFavicon = "public/brand/campus-allemagne-favicon-v3.svg";

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

test("exact approved Campus Allemagne artwork is used across public and authenticated shells", () => {
  assert.match(header, /BrandLogo/);
  assert.match(footer, /BrandLogo/);
  assert.match(shell, /BrandLogo/);
  assert.ok(existsSync(approvedLogo));
  assert.ok(existsSync(approvedSymbol));
  assert.ok(statSync(approvedLogo).size > 1000);
  assert.ok(statSync(approvedSymbol).size > 1000);
  assert.match(brandLogo, /campus-allemagne-logo-approved\.png/);
  assert.match(brandLogo, /campus-allemagne-symbol-approved\.png/);
  assert.doesNotMatch(brandLogo, /campus-allemagne-logo(?:-reverse)?\.svg/);
  assert.doesNotMatch(brandLogo, /campus-allemagne-symbol(?:-reverse)?\.svg/);
  assert.match(footer, /footerLogoLink/);
});

test("localized public copy is rebranded without rewriting locale source files", () => {
  assert.match(brand, /BRAND_NAME = "Campus Allemagne"/);
  assert.match(brand, /LEGACY_BRAND_NAME = "AlmaGo"/);
  assert.match(provider, /rebrandCopy\(getNativeCopy\(locale\)\)/);
  assert.match(footer, /© Campus Allemagne/);
});

test("browser favicon uses the dedicated Campus Allemagne icon while PWA keeps the approved compact mark", () => {
  assert.match(layout, /applicationName: BRAND_NAME/);
  assert.match(layout, /siteName: BRAND_NAME/);
  assert.ok(existsSync(approvedFavicon));
  assert.ok(statSync(approvedFavicon).size > 200);
  assert.ok(existsSync("src/app/icon.svg"));
  assert.ok(!existsSync("src/app/icon.png"));
  assert.match(layout, /campus-allemagne-favicon-v3\.svg\?v=3/);
  assert.match(layout, /image\/svg\+xml/);
  assert.match(layout, /shortcut/);
  assert.match(manifest, /name: "Campus Allemagne"/);
  assert.match(manifest, /campus-allemagne-symbol-approved\.png/);
  assert.match(manifest, /type: "image\/png"/);
});
