import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { loginWithRedactedPassword } from "./auth-test-helpers.mjs";

const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const configured = Boolean(adminEmail && adminPassword);

const pages = [
  { path: "/admin", name: "dashboard" },
  { path: "/admin/documents", name: "documents" },
  { path: "/admin/applications", name: "applications" },
  { path: "/admin/orientation", name: "orientation" },
  { path: "/admin/prospects", name: "prospects" },
  { path: "/admin/universities", name: "universities" },
  { path: "/admin/programs", name: "programs" },
  { path: "/admin/language-courses", name: "language-courses" },
  { path: "/admin/finance-insurance", name: "finance-insurance" },
  { path: "/admin/offers", name: "offers" },
  { path: "/admin/payments", name: "payments" },
];

mkdirSync("artifacts/auth-e2e/admin-screenshots", { recursive: true });

test.describe("authenticated Admin Space quality", () => {
  test.setTimeout(180_000);
  test.skip(!configured, "Admin Space quality requires the dedicated admin E2E account.");

  test("all admin pages fit, remain accessible and capture responsive evidence", async ({ page }, testInfo) => {
    await loginWithRedactedPassword(page, adminEmail, adminPassword, "admin");

    for (const target of pages) {
      if (new URL(page.url()).pathname !== target.path) {
        const response = await page.goto(target.path, { waitUntil: "commit", timeout: 20_000 });
        expect(response, target.path + " should return a response").not.toBeNull();
        expect(response?.ok(), target.path + " should return a successful response").toBeTruthy();
      }
      await page.waitForURL((url) => url.pathname === target.path, { timeout: 20_000 });
      await expect(page.locator("#main-content")).toBeVisible({ timeout: 20_000 });
      expect(new URL(page.url()).pathname, target.path + " should stay in the requested admin route").toBe(target.path);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, target.path + " must not overflow horizontally").toBeLessThanOrEqual(1);

      const results = await new AxeBuilder({ page }).analyze();
      const severe = results.violations.filter(
        (item) => item.impact === "serious" || item.impact === "critical",
      );
      expect(severe, target.path + "\n" + JSON.stringify(severe, null, 2)).toEqual([]);

      if ((testInfo.project.use.viewport?.width || 1440) < 1024) {
        const menuButton = page.getByRole("button", { name: /menu administration/i });
        await expect(menuButton).toBeVisible();
      }

      await page.screenshot({
        path: "artifacts/auth-e2e/admin-screenshots/" + target.name + "-" + testInfo.project.name + ".png",
        fullPage: true,
      });
    }
  });
});
