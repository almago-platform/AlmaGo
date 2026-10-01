import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

const origin = read("src/lib/public-origin.ts");
const indexing = read("src/lib/public-indexing.ts");
const layout = read("src/app/layout.tsx");
const contact = read("src/app/contact/page.tsx");
const legal = read("src/app/legal/[document]/page.tsx");
const env = read(".env.example");
const sitemap = read("src/app/sitemap.ts");
const robots = read("src/app/robots.ts");
const nextConfig = read("next.config.ts");
const manifest = read("src/app/manifest.ts");
const i18n = read("src/lib/i18n.ts");

test("public metadata resolves an absolute non-local production origin", () => {
  assert.match(origin, /process\.env\.SITE_URL/);
  assert.match(origin, /x-forwarded-host/);
  assert.match(origin, /RENDER_EXTERNAL_URL/);
  assert.match(origin, /VERCEL_PROJECT_PRODUCTION_URL/);
  assert.match(origin, /process\.env\.NODE_ENV !== "production"/);

  assert.match(layout, /metadataBase: publicOrigin/);
  assert.match(layout, /canonical: homeUrl/);
  assert.match(layout, /url: homeUrl/);
  assert.match(layout, /socialImageUrl/);
  assert.doesNotMatch(layout, /localhost|alma-go\.vercel\.app/i);
});


test("public indexing is an explicit launch gate and defaults off", () => {
  assert.match(indexing, /process\.env\.ALMAGO_PUBLIC_INDEXING_ENABLED === "true"/);
  assert.match(env, /ALMAGO_PUBLIC_INDEXING_ENABLED=false/);
  assert.match(layout, /const indexingEnabled = isPublicIndexingEnabled\(\)/);
  assert.match(layout, /index: indexingEnabled/);
  assert.match(layout, /follow: indexingEnabled/);
  assert.match(contact, /const indexingEnabled = isPublicIndexingEnabled\(\)/);
  assert.match(contact, /index: indexingEnabled/);
  assert.match(legal, /const indexable = ready && isPublicIndexingEnabled\(\)/);
  assert.match(legal, /index: indexable/);
});

test("sitemap is empty before launch and exposes public routes only after indexing is enabled", () => {
  assert.match(sitemap, /if \(!isPublicIndexingEnabled\(\)\) return \[\]/);
  assert.match(sitemap, /new URL\("\/", publicOrigin\)\.toString\(\)/);
  assert.match(sitemap, /changeFrequency: "weekly"/);
  assert.match(sitemap, /priority: 1/);

  for (const privatePath of [
    "/student/",
    "/admin/",
    "/login",
    "/signup",
    "/reset-password",
    "/unauthorized",
    "/api/",
    "/auth/",
  ]) {
    assert.doesNotMatch(sitemap, new RegExp(privatePath.replaceAll("/", "\\/")));
  }
});

test("robots blocks all crawling before launch and preserves private route blocks when enabled", () => {
  assert.match(robots, /if \(!isPublicIndexingEnabled\(\)\)/);
  assert.match(robots, /disallow: \["\/"\]/);
  assert.match(robots, /allow: \["\/"\]/);
  assert.match(robots, /sitemap: new URL\("\/sitemap\.xml", publicOrigin\)\.toString\(\)/);

  for (const privatePath of [
    "/admin/",
    "/student/",
    "/login",
    "/signup",
    "/reset-password",
    "/unauthorized",
    "/auth/",
    "/api/",
  ]) {
    assert.match(robots, new RegExp(privatePath.replaceAll("/", "\\/")));
  }
});

test("private and account-management surfaces remain explicitly noindex", () => {
  for (const path of [
    "src/app/admin/layout.tsx",
    "src/app/student/layout.tsx",
    "src/app/login/page.tsx",
    "src/app/signup/page.tsx",
    "src/app/reset-password/page.tsx",
    "src/app/unauthorized/page.tsx",
  ]) {
    assert.match(read(path), /robots: \{ index: false, follow: false \}/, path);
  }
});

test("cookie-based locales keep lang dir and OG locale without fake hreflang URLs", () => {
  assert.match(i18n, /supportedLocales = \["fr", "ar", "en", "de"\]/);
  assert.match(layout, /lang=\{locale\}/);
  assert.match(layout, /dir=\{localeDirection\(locale\)\}/);
  assert.match(layout, /locale: localeOpenGraph\(locale\)/);
  assert.doesNotMatch(layout, /languages\s*:/);
});

test("approved branding and baseline security headers stay intact", () => {
  assert.match(manifest, /name: "Campus Allemagne"/);
  assert.match(layout, /applicationName: BRAND_NAME/);
  assert.match(layout, /siteName: BRAND_NAME/);

  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Strict-Transport-Security",
  ]) {
    assert.match(nextConfig, new RegExp(header));
  }
});
