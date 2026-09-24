import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const configured = Boolean(studentEmail && studentPassword);

const pages = [
  { path: "/student", name: "dashboard" },
  { path: "/student/profile", name: "profile" },
  { path: "/student/documents", name: "documents" },
  { path: "/student/orientation", name: "orientation" },
  { path: "/student/checklist", name: "checklist" },
  { path: "/student/echeances", name: "deadlines" },
  { path: "/student/applications", name: "applications" },
];

mkdirSync("artifacts/auth-e2e/screenshots", { recursive: true });

test.describe("authenticated Student Space quality", () => {
  test.skip(!configured, "Student Space quality requires the dedicated student E2E account.");

  test("all student pages fit, remain accessible and capture responsive evidence", async ({ page }, testInfo) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(studentEmail);
    await page.getByLabel("Mot de passe").fill(studentPassword);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/\/student(?:\/.*)?$/, { timeout: 20_000 });

    for (const target of pages) {
      const response = await page.goto(target.path, { waitUntil: "networkidle" });
      expect(response, target.path + " should return a response").not.toBeNull();
      expect(response?.ok(), target.path + " should return a successful response").toBeTruthy();
      expect(new URL(page.url()).pathname, target.path + " should stay in the requested student route").toBe(target.path);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, target.path + " must not overflow horizontally").toBeLessThanOrEqual(1);

      const results = await new AxeBuilder({ page }).analyze();
      const severe = results.violations.filter(item => item.impact === "serious" || item.impact === "critical");
      expect(severe, target.path + "\n" + JSON.stringify(severe, null, 2)).toEqual([]);

      if ((testInfo.project.use.viewport?.width || 1440) < 1024) {
        const menuButton = page.getByRole("button", { name: /menu étudiant/i });
        await expect(menuButton).toBeVisible();
      }

      await page.screenshot({
        path: "artifacts/auth-e2e/screenshots/" + target.name + "-" + testInfo.project.name + ".png",
        fullPage: true,
      });
    }
  });
});
