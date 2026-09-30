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

    const deniedPage = await page.request.get(
      new URL("/admin", page.url()).toString(),
      { maxRedirects: 0 },
    );
    expect([303, 307, 308]).toContain(deniedPage.status());
    expect(deniedPage.headers().location || "").toMatch(/\/unauthorized$/);

    const deniedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(deniedApi.status()).toBe(403);
  });

  test("admin account passes server-side page and API role guards", async ({ page }) => {
    await loginWithRedactedPassword(page, adminEmail, adminPassword, "admin");
    expect(new URL(page.url()).pathname).toMatch(/^\/admin(?:\/|$)/);
    await expect(page.locator("#main-content")).toBeVisible();

    const authorizedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(authorizedApi.status()).toBe(400);
  });
});
