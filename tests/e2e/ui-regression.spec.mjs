import { mkdirSync } from "node:fs";
import { test, expect } from "@playwright/test";

const publicRoutes = [
  { path: "/", name: "home", premium: null },
  { path: "/login", name: "login", premium: ".auth-form-card.pc-panel" },
  { path: "/signup", name: "signup", premium: ".auth-form-card.pc-panel" },
  { path: "/orientation", name: "orientation", premium: ".professional-panel.pc-panel" },
  { path: "/contact", name: "contact", premium: null },
];

mkdirSync("artifacts/visual-v3-2", { recursive: true });

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, label + " must not overflow horizontally").toBeLessThanOrEqual(1);
}

async function expectNonceCsp(page, response, label) {
  const csp = response?.headers()["content-security-policy-report-only"] || "";
  expect(csp, label + " should return CSP Report-Only").toContain("script-src 'self'");

  const matches = [...csp.matchAll(/script-src[^;]*'nonce-([^']+)'[^;]*'strict-dynamic'/g)];
  expect(matches, label + " should expose exactly one nonce-based script policy").toHaveLength(1);
  const nonce = matches[0][1];

  expect(csp).not.toContain("'unsafe-eval'");
  expect(csp).toContain("report-uri /api/security/csp-report");
  expect(response?.headers()["content-security-policy"]).toBeUndefined();

  const renderedNonces = await page.locator("script").evaluateAll((scripts) =>
    scripts.map((script) => script.nonce).filter(Boolean),
  );
  expect(renderedNonces.length, label + " should render nonce-bearing Next scripts").toBeGreaterThan(0);
  for (const renderedNonce of renderedNonces) {
    expect(renderedNonce).toBe(nonce);
  }
}

function maxCssDuration(value) {
  return Math.max(
    ...String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => item.endsWith("ms")
        ? Number.parseFloat(item) / 1000
        : Number.parseFloat(item))
      .filter(Number.isFinite),
    0,
  );
}

test.describe("V3.2 bounded public visual regression gate", () => {
  test("core public and candidate routes fit the active viewport", async ({ page }, testInfo) => {
    for (const target of publicRoutes) {
      const response = await page.goto(target.path, { waitUntil: "networkidle" });
      expect(response, target.path + " should return a response").not.toBeNull();
      expect(response?.ok(), target.path + " should return successfully").toBeTruthy();

      if (target.name === "home") {
        await expectNonceCsp(page, response, target.path);
      }

      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("main").first()).toBeVisible();
      await expect(page.locator("main h1:visible, main h2:visible").first()).toBeVisible();
      await expectNoHorizontalOverflow(page, target.path);

      if (target.premium) {
        await expect(page.locator(target.premium).first()).toBeVisible();
      }

      if (
        (target.name === "home" || target.name === "orientation") &&
        (testInfo.project.name === "mobile-compact-chromium" ||
          testInfo.project.name === "desktop-1280-chromium")
      ) {
        // Full-page screenshots do not consistently trigger below-the-fold
        // native lazy images. Scroll and decode every restored journey photo,
        // so the visual artifact reflects what a visitor sees while browsing.
        if (target.name === "home") {
          const photos = page.locator("#parcours ol > li[id] img");
          await expect(photos).toHaveCount(6);
          for (let index = 0; index < 6; index++) {
            const photo = photos.nth(index);
            await photo.scrollIntoViewIfNeeded();
            await expect.poll(async () => photo.evaluate((image) => image.complete && image.naturalWidth > 0), {
              timeout: 20000,
              message: "All six restored photos must load after scrolling, including on mobile",
            }).toBe(true);
          }
          await page.evaluate(() => window.scrollTo(0, 0));
        }
        await page.screenshot({
          path: `artifacts/visual-v3-2/${target.name}-${testInfo.project.name}.png`,
          fullPage: true,
        });
      }
    }
  });

  test("Arabic public journey is truly RTL and remains overflow-safe", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    const switcher = page.locator("header select:visible").first();
    await expect(switcher).toBeVisible();
    await switcher.selectOption("ar");

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expectNoHorizontalOverflow(page, "Arabic homepage");

    await page.goto("/orientation", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator(".professional-panel.pc-panel").first()).toBeVisible();
    await expectNoHorizontalOverflow(page, "Arabic orientation");
  });

  test("reduced-motion disables non-essential premium transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/login", { waitUntil: "networkidle" });

    const result = await page.locator(".pc-button").first().evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
        transitionDuration: style.transitionDuration,
        animationDuration: style.animationDuration,
      };
    });

    expect(result.mediaMatches).toBe(true);
    expect(maxCssDuration(result.transitionDuration)).toBeLessThanOrEqual(0.02);
    expect(maxCssDuration(result.animationDuration)).toBeLessThanOrEqual(0.02);
  });
});
