import { test, expect } from "@playwright/test";

const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const configured = Boolean(studentEmail && studentPassword && adminEmail && adminPassword);

test.describe("authenticated role journeys", () => {
  test.skip(!configured, "Authenticated E2E requires dedicated test-account secrets.");

  async function login(page, email, password, expectedArea) {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Mot de passe").fill(password);
    await page.getByRole("button", { name: "Se connecter" }).click();

    const areaPattern = new RegExp(`/${expectedArea}(?:/.*)?$`);
    await page.waitForURL(areaPattern, { timeout: 20_000 });
  }

  test("student account reaches only the student area", async ({ page }) => {
    await login(page, studentEmail, studentPassword, "student");
    expect(new URL(page.url()).pathname).toMatch(/^\/student(?:\/|$)/);

    const allowedStudentApi = await page.request.post("/api/student/applications", {
      data: {},
    });
    expect(allowedStudentApi.status()).toBe(400);

    await page.goto("/admin", { waitUntil: "networkidle" });
    await page.waitForURL(/\/unauthorized$/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe("/unauthorized");

    const deniedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(deniedApi.status()).toBe(403);
  });

  test("admin account reaches only the admin area", async ({ page }) => {
    await login(page, adminEmail, adminPassword, "admin");
    expect(new URL(page.url()).pathname).toMatch(/^\/admin(?:\/|$)/);

    await page.goto("/student", { waitUntil: "networkidle" });
    await page.waitForURL(/\/unauthorized$/, { timeout: 20_000 });
    expect(new URL(page.url()).pathname).toBe("/unauthorized");

    const deniedStudentApi = await page.request.post("/api/student/applications", {
      data: {},
    });
    expect(deniedStudentApi.status()).toBe(403);

    const response = await page.goto("/admin", { waitUntil: "networkidle" });
    expect(response?.ok()).toBeTruthy();
    expect(new URL(page.url()).pathname).toMatch(/^\/admin(?:\/|$)/);

    const authorizedApi = await page.request.post("/api/admin/orientation", {
      data: {},
    });
    expect(authorizedApi.status()).toBe(400);
  });
});
