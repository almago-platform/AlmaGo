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
