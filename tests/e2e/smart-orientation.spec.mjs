import { mkdirSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";
import { loginWithRedactedPassword } from "./auth-test-helpers.mjs";

const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const adminConfigured = Boolean(adminEmail && adminPassword);

const SESSION_KEY = "almago_phase2_orientation_v1";

mkdirSync("artifacts/smart-orientation", { recursive: true });

function baseAnswers(overrides = {}) {
  return {
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Sciences expérimentales",
    generalAverage: "15",
    averageType: "official",
    lastDiploma: "",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    engineeringSpecialty: "",
    germanLevel: "B2",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    targetIntakeSeason: "",
    targetIntakeYear: "",
    budgetRange: "1 000–1 200 € / mois",
    preferredCities: [],
    ...overrides,
  };
}

async function showResult(page, answers) {
  await page.goto("/orientation", { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, value }) => {
      window.sessionStorage.setItem(key, JSON.stringify({ answers: value, step: 5 }));
    },
    { key: SESSION_KEY, value: answers },
  );
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("#orientation-report")).toBeVisible();
}

async function assertNoSeriousA11y(page) {
  const results = await new AxeBuilder({ page }).analyze();
  const severe = results.violations.filter(
    (item) => item.impact === "serious" || item.impact === "critical",
  );
  expect(severe, JSON.stringify(severe, null, 2)).toEqual([]);
}

async function assertNoOverflow(page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test.describe("Smart Orientation Partner-Ready rehearsal", () => {
  test.setTimeout(120_000);

  test("French scenarios prioritize without rejecting or promising admission", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Desktop carries the full deterministic scenario matrix.");

    await showResult(page, baseAnswers({
      generalAverage: "15",
      targetField: "Médecine/Santé",
      germanLevel: "A2",
    }));

    await expect(page.getByRole("heading", { name: "Nous pouvons maintenant construire votre route" })).toBeVisible();
    await expect(page.getByText("Votre niveau de langue devient une étape de la route", { exact: false })).toBeVisible();
    await expect(page.getByText("Votre domaine demande une vérification individualisée", { exact: false })).toBeVisible();
    await expect(page.getByText("Route prête à structurer")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Des options vérifiées pour votre profil" })).toBeVisible();
    await expect(page.getByText("Les options détaillées sont momentanément indisponibles", { exact: false })).toHaveCount(0);
    await expect(page.locator("#orientation-prospect-capture")).toHaveCount(0);
    await assertNoSeriousA11y(page);
    await assertNoOverflow(page);

    await showResult(page, baseAnswers({
      bacStatus: "preparing",
      generalAverage: "14",
      averageType: "current_estimate",
      targetField: "Informatique",
      germanLevel: "A2",
    }));
    await expect(page.getByRole("heading", { name: "Vous pouvez commencer votre préparation dès maintenant" })).toBeVisible();
    await expect(page.getByText("À préparer dès maintenant")).toBeVisible();
    await expect(page.getByText(/trop tôt/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Des options vérifiées pour votre profil" })).toBeVisible();
    await expect(page.getByText("Pour quelle rentrée souhaitez-vous commencer ?")).toBeVisible();
    await expect(page.getByText("Les options détaillées sont momentanément indisponibles", { exact: false })).toHaveCount(0);

    await showResult(page, baseAnswers({
      generalAverage: "10",
      targetField: "Économie/Gestion",
    }));
    await expect(page.getByRole("heading", { name: "Votre projet peut déjà être préparé" })).toBeVisible();
    await expect(page.getByText("Projet à développer")).toBeVisible();

    await showResult(page, baseAnswers({
      generalAverage: "",
      averageType: "",
      targetField: "Ingénierie",
      engineeringSpecialty: "computer_engineering",
    }));
    await expect(page.getByRole("heading", { name: "Votre projet peut déjà être préparé" })).toBeVisible();

    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/admission garantie|visa garanti|fortes chances d.?admission/i);

    await page.screenshot({
      path: "artifacts/smart-orientation/french-desktop.png",
      fullPage: true,
    });
  });

  test("Arabic RTL Smart Orientation stays readable on mobile 360", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-360-chromium", "Mobile 360 carries the Arabic/RTL evidence.");

    await page.goto("/orientation", { waitUntil: "networkidle" });
    const switcher = page.locator("header select:visible").first();
    await expect(switcher).toBeVisible();
    await switcher.selectOption("ar");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    await page.evaluate(
      ({ key, value }) => {
        window.sessionStorage.setItem(key, JSON.stringify({ answers: value, step: 5 }));
      },
      {
        key: SESSION_KEY,
        value: baseAnswers({
          bacStatus: "preparing",
          generalAverage: "14",
          averageType: "current_estimate",
          germanLevel: "A2",
        }),
      },
    );
    await page.reload({ waitUntil: "networkidle" });

    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { name: "يمكنك البدء في التحضير من الآن" })).toBeVisible();
    await expect(page.getByText("ابدأ التحضير الآن")).toBeVisible();
    await assertNoSeriousA11y(page);
    await assertNoOverflow(page);

    await page.screenshot({
      path: "artifacts/smart-orientation/arabic-mobile-360.png",
      fullPage: true,
    });
  });

  test("admin sees the protected explainable priority queue", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "Admin queue needs one desktop proof.");
    test.skip(!adminConfigured, "Dedicated admin E2E identity is required.");

    await loginWithRedactedPassword(page, adminEmail, adminPassword, "admin");
    const response = await page.goto("/admin/prospects", { waitUntil: "networkidle" });
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "À traiter en priorité" })).toBeVisible();

    for (const name of ["priority", "bac", "contact", "field"]) {
      await expect(page.locator(`select[name="${name}"]`)).toBeVisible();
    }

    await expect(page.getByText(/prospects sauvegardés/i)).toBeVisible();
    await expect(page.getByText(/ne décident pas automatiquement si le marché est validé/i)).toBeVisible();
    await assertNoSeriousA11y(page);
    await assertNoOverflow(page);
  });
});
