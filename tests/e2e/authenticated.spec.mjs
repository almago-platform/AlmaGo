import { test, expect } from "@playwright/test";

const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const configured = Boolean(studentEmail && studentPassword && adminEmail && adminPassword);

test.describe("authenticated role journeys", () => {
  test.skip(!configured, "Authenticated E2E requires dedicated test-account secrets.");

  async function login(page, email, password) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();
    await page.waitForURL(/\/student(?:\/.*)?$/, { timeout: 20_000 });
  }

  test("student account reaches only the student area", async ({ page }) => {
    await login(page, studentEmail, studentPassword);
    expect(new URL(page.url()).pathname).toMatch(/^\/student(?:\/|$)/);

    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.waitForURL(/\/unauthorized$/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe("/unauthorized");
  });

  test("admin account passes the server-side admin role guard", async ({ page }) => {
    await login(page, adminEmail, adminPassword);
    const response = await page.goto("/admin", { waitUntil: "networkidle" });
    expect(response?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toMatch(/^\/admin(?:\/|$)/);
  });
});
