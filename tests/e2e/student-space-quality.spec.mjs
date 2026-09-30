import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { loginWithRedactedPassword } from "./auth-test-helpers.mjs";

const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const configured = Boolean(studentEmail && studentPassword);

const pages = [
  { path: "/student", name: "dashboard" },
  { path: "/student/profile", name: "profile" },
  { path: "/student/documents", name: "documents" },
  { path: "/student/orientation", name: "orientation" },
  { path: "/student/checklist", name: "checklist" },
  { path: "/student/applications", name: "applications" },
  { path: "/student/project", name: "project" },
  { path: "/student/pathway", name: "pathway" },
  { path: "/student/language-courses", name: "language-courses" },
  { path: "/student/finance-insurance", name: "finance-insurance" },
];

mkdirSync("artifacts/auth-e2e/screenshots", { recursive: true });

test.describe("authenticated Student Space quality", () => {
  test.setTimeout(180_000);
  test.skip(!configured, "Student Space quality requires the dedicated student E2E account.");

  test("all student pages fit, remain accessible and capture responsive evidence", async ({ page }, testInfo) => {
    await loginWithRedactedPassword(page, studentEmail, studentPassword, "student");

    const viewportWidth = testInfo.project.use.viewport?.width || 1440;
    if (viewportWidth < 1024) {
      await page.getByRole("button", { name: /menu étudiant/i }).click();
    }

    const languageSwitcher = page.locator("select:visible").first();
    await expect(languageSwitcher).toBeVisible();
    await languageSwitcher.selectOption("ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    if (viewportWidth < 1024) {
      const mobileMenuButton = page.locator('button[aria-controls="student-mobile-menu"]');
      await expect(mobileMenuButton).toBeVisible();
      if ((await mobileMenuButton.getAttribute("aria-expanded")) === "true") {
        await mobileMenuButton.click();
      }
    }

    for (const target of pages) {
      if (new URL(page.url()).pathname !== target.path) {
        const response = await page.goto(target.path, { waitUntil: "commit", timeout: 20_000 });
        expect(response, target.path + " should return a response").not.toBeNull();
        expect(response?.ok(), target.path + " should return a successful response").toBeTruthy();
      }
      await page.waitForURL((url) => url.pathname === target.path, { timeout: 20_000 });
      await expect(page.locator("#main-content")).toBeVisible({ timeout: 20_000 });
      expect(new URL(page.url()).pathname, target.path + " should stay in the requested student route").toBe(target.path);

      await expect(page.locator("html")).toHaveAttribute("lang", "ar");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.getByRole("link", { name: "الصفحة الرئيسية لـ Campus Allemagne" }).first()).toBeVisible();

      if (target.name === "project") {
        await expect(page.getByRole("heading", { name: "حدّد هدفك في ألمانيا" })).toBeVisible();
      }
      if (target.name === "applications") {
        await expect(page.getByText("قبل التقديم", { exact: true })).toBeVisible();
      }
      if (target.name === "pathway") {
        await expect(page.getByText("المعلومات الرسمية التي يجب التحقق منها", { exact: true })).toBeVisible();
      }
      if (target.name === "language-courses") {
        await expect(page.getByRole("heading", { name: "دورات لغة بمصادر واضحة" })).toBeVisible();
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, target.path + " must not overflow horizontally").toBeLessThanOrEqual(1);

      if (viewportWidth >= 1024) {
        const sidebar = page.locator(".student-shell-sidebar");
        const main = page.locator(".student-shell-main");
        const desktopHeader = page.locator(".student-shell-desktop-header");
        await expect(sidebar).toBeVisible();
        await expect(main).toBeVisible();
        await expect(desktopHeader).toBeVisible();

        const [sidebarBox, mainBox, headerBox] = await Promise.all([
          sidebar.boundingBox(),
          main.boundingBox(),
          desktopHeader.boundingBox(),
        ]);
        expect(sidebarBox, target.path + " sidebar should have a box").not.toBeNull();
        expect(mainBox, target.path + " main should have a box").not.toBeNull();
        expect(headerBox, target.path + " desktop header should have a box").not.toBeNull();
        expect(sidebarBox.x, target.path + " Arabic sidebar should sit to the right of main").toBeGreaterThan(mainBox.x);
        expect(
          mainBox.x + mainBox.width,
          target.path + " main content must stop before the Arabic sidebar",
        ).toBeLessThanOrEqual(sidebarBox.x + 1);
        expect(
          headerBox.x + headerBox.width,
          target.path + " desktop header must stop before the Arabic sidebar",
        ).toBeLessThanOrEqual(sidebarBox.x + 1);
      }

      if (target.name === "profile") {
        const telInput = page.locator('input[type="tel"]');
        const dateInput = page.locator('input[type="date"]');
        const autoInputs = page.locator('input[dir="auto"]');
        await expect(telInput).toHaveAttribute("dir", "ltr");
        await expect(dateInput).toHaveAttribute("dir", "ltr");
        expect(await autoInputs.count(), "Arabic profile should auto-detect direction for free-text values").toBeGreaterThan(0);
      }

      if (target.name === "orientation" && viewportWidth >= 1024) {
        const guidancePanel = page.locator(".student-guidance-panel");
        const guidanceFigure = guidancePanel.locator("figure");
        const guidanceContent = guidancePanel.locator(".student-guidance-content");
        const [figureBox, contentBox] = await Promise.all([
          guidanceFigure.boundingBox(),
          guidanceContent.boundingBox(),
        ]);
        expect(figureBox, "Arabic orientation guidance image should have a visible box").not.toBeNull();
        expect(contentBox, "Arabic orientation guidance copy should have a visible box").not.toBeNull();
        expect(
          contentBox.x,
          "Arabic orientation guidance copy should sit to the right of its supporting image",
        ).toBeGreaterThan(figureBox.x);
      }

      if (target.name === "project") {
        const citySearch = page.getByPlaceholder("ابحث عن مدينة في ألمانيا");
        await expect(citySearch).toBeVisible();
        await expect(citySearch).toHaveAttribute("dir", "ltr");
        await expect(page.locator('input[name="current_german_level"]')).toHaveAttribute("dir", "ltr");
        await expect(page.locator('input[name="target_german_level"]')).toHaveAttribute("dir", "ltr");
        expect(
          await page.locator('input[dir="auto"]').count(),
          "Arabic project should auto-detect direction for mixed free-text values",
        ).toBeGreaterThan(0);
        expect(
          await page.locator('textarea[dir="auto"]').count(),
          "Arabic project textareas should auto-detect user content direction",
        ).toBeGreaterThanOrEqual(2);
      }

      if (target.name === "checklist") {
        const checklistText = await page.locator("#main-content").innerText();
        for (const frenchTemplateText of [
          "Passeport validé",
          "Ajouter mon passeport",
          "Traductions nécessaires",
          "Préparer les traductions demandées",
          "Orientation universitaire",
          "Consulter mes programmes proposés",
          "Préparer mes candidatures",
          "Suivre les admissions",
          "Préparer l’arrivée en Allemagne",
          "Préparer le départ après admission",
        ]) {
          expect(checklistText, "Arabic checklist must not expose stored French template copy").not.toContain(frenchTemplateText);
        }
        expect(checklistText).toContain("أضف جواز سفرك");
        expect(checklistText).toContain("جهّز الترجمات المطلوبة");
        expect(checklistText).toContain("قارن البرامج المناسبة لك");
      }

      const results = await new AxeBuilder({ page }).analyze();
      const severe = results.violations.filter(item => item.impact === "serious" || item.impact === "critical");
      expect(severe, target.path + "\n" + JSON.stringify(severe, null, 2)).toEqual([]);

      if (viewportWidth < 1024) {
        const menuButton = page.getByRole("button", { name: /فتح قائمة الطالب/ });
        await expect(menuButton).toBeVisible();
      }

      await page.screenshot({
        path: "artifacts/auth-e2e/screenshots/" + target.name + "-" + testInfo.project.name + ".png",
        fullPage: true,
      });
    }
  });
});
