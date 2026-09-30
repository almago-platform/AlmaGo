import { test, expect } from "@playwright/test";
import { loginWithRedactedPassword } from "./auth-test-helpers.mjs";

const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const configured = Boolean(studentEmail && studentPassword && adminEmail && adminPassword);

test.describe("authenticated role journeys", () => {
  test.setTimeout(60_000);
  test.skip(!configured, "Authenticated E2E requires dedicated test-account secrets.");

  test("student account reaches only the student area", async ({ page }) => {
    await loginWithRedactedPassword(page, studentEmail, studentPassword, "student");
    expect(new URL(page.url()).pathname).toMatch(/^\/student(?:\/|$)/);

    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/unauthorized$/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe("/unauthorized");

    const deniedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(deniedApi.status()).toBe(403);
  });

  test("admin account passes server-side page and API role guards", async ({ page }) => {
    await loginWithRedactedPassword(page, adminEmail, adminPassword, "admin");
    const response = await page.goto("/admin", { waitUntil: "domcontentloaded" });
    expect(response?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toMatch(/^\/admin(?:\/|$)/);

    const authorizedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(authorizedApi.status()).toBe(400);
  });
});
