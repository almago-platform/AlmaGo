import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loginWithRedactedPassword } from "./auth-test-helpers.mjs";

const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const configured = Boolean(adminEmail && adminPassword);

test.describe("Partner-Ready admin demo", () => {
  test.setTimeout(90_000);
  test.skip(!configured, "Partner demo requires the dedicated admin test identity.");

  test("email previews and zero-money payment sandbox are demonstrable", async ({ page }) => {
    await loginWithRedactedPassword(page, adminEmail, adminPassword, "admin");
    await page.goto("/admin/partner-demo", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { name: "Démonstration partenaires" })).toBeVisible();
    await expect(page.locator('iframe[title="E-mail d’orientation — français"]')).toBeVisible();
    await expect(page.locator('iframe[title="رسالة التوجيه — العربية"]')).toBeVisible();

    const sandbox = page.locator('[data-partner-payment-sandbox="true"]');
    await expect(sandbox).toBeVisible();
    await expect(sandbox.getByRole("status")).toContainText("Offre sélectionnée");

    await sandbox.getByRole("button", { name: "Créer la tentative sandbox" }).click();
    await expect(sandbox.getByRole("status")).toContainText("Paiement en attente");

    await sandbox.getByRole("button", { name: "Simuler un paiement réussi" }).click();
    await expect(sandbox.getByRole("status")).toContainText("validation interne requise");

    await sandbox.getByRole("button", { name: "Simuler la validation admin" }).click();
    await expect(sandbox.getByRole("status")).toContainText("Client actif");

    await sandbox.getByRole("button", { name: "Simuler un remboursement" }).click();
    await expect(sandbox.getByRole("status")).toContainText("Remboursé");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter(
      (item) => item.impact === "serious" || item.impact === "critical",
    );
    expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
  });
});
