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
    ![
      "desktop-chromium",
      "tablet-landscape-chromium",
      "tablet-chromium",
      "mobile-375-chromium",
      "mobile-chromium",
    ].includes(testInfo.project.name),
    "Arabic RTL is checked at every requested representative width.",
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
  await expect(page.getByRole("heading", { name: /ابدأ دراستك/ })).toBeVisible();
  const rtlOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(rtlOverflow, "Arabic homepage must not overflow horizontally").toBeLessThanOrEqual(1);

  const heroCopy = page.getByRole("heading", { name: /ابدأ دراستك/ }).locator("..");
  const heroDossier = page.locator('aside[aria-label="مثال على ملف AlmaGo"]');
  await expect(heroDossier).toBeVisible();
  const [heroCopyBox, heroDossierBox] = await Promise.all([
    heroCopy.boundingBox(),
    heroDossier.boundingBox(),
  ]);
  expect(heroCopyBox, "Arabic hero copy should have a visible box").not.toBeNull();
  expect(heroDossierBox, "Arabic dossier card should have a visible box").not.toBeNull();
  const overlaps = heroCopyBox && heroDossierBox &&
    heroCopyBox.x < heroDossierBox.x + heroDossierBox.width &&
    heroCopyBox.x + heroCopyBox.width > heroDossierBox.x &&
    heroCopyBox.y < heroDossierBox.y + heroDossierBox.height &&
    heroCopyBox.y + heroCopyBox.height > heroDossierBox.y;
  expect(overlaps, "Arabic hero dossier must not cover the copy or CTA").toBeFalsy();

  if (testInfo.project.name === "tablet-chromium") {
    await expect(page.getByRole("navigation", { name: "القائمة الرئيسية" })).toBeHidden();
    await expect(page.getByRole("button", { name: "فتح القائمة" })).toBeVisible();
  }

  await page.screenshot({
    path: "artifacts/screenshots/home-ar-" + testInfo.project.name + ".png",
    fullPage: true,
  });

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
