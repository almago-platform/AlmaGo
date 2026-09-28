import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", name: "home" },
  { path: "/login", name: "login" },
  { path: "/signup", name: "signup" },
  { path: "/unauthorized", name: "unauthorized" },
];

mkdirSync("artifacts/screenshots", { recursive: true });

for (const target of pages) {
  test(target.name + " renders, fits the viewport and has no serious accessibility violation", async ({ page }, testInfo) => {
    const response = await page.goto(target.path, { waitUntil: "networkidle" });
    expect(response, "navigation should return a response").not.toBeNull();
    expect(response?.ok(), "page should return a successful HTTP response").toBeTruthy();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, "page must not overflow horizontally").toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter(item => item.impact === "serious" || item.impact === "critical");
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);

    await page.screenshot({
      path: "artifacts/screenshots/" + target.name + "-" + testInfo.project.name + ".png",
      fullPage: true,
    });
  });
}


test("native language switch persists and Arabic renders RTL without overflow", async ({ page }, testInfo) => {
  test.skip(
    !["desktop-chromium", "mobile-375-chromium"].includes(testInfo.project.name),
    "Representative desktop and mobile coverage is sufficient for locale switching.",
  );

  await page.goto("/login", { waitUntil: "networkidle" });

  const switcher = page.locator("select:visible").first();
  await expect(switcher).toBeVisible();

  await switcher.selectOption("ar");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: "تسجيل الدخول" })).toBeVisible();

  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { name: /مشروع دراستك/ })).toBeVisible();
  const rtlOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(rtlOverflow, "Arabic homepage must not overflow horizontally").toBeLessThanOrEqual(1);

  await page.goto("/login", { waitUntil: "networkidle" });
  const englishSwitcher = page.locator("select:visible").first();
  await englishSwitcher.selectOption("en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();

  await page.locator("select:visible").first().selectOption("de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Anmelden" })).toBeVisible();

  await page.locator("select:visible").first().selectOption("fr");
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
});
