import { test, expect } from "@playwright/test";

const SESSION_KEY = "almago_phase2_orientation_v1";
const answers = {
  bacStatus: "obtained",
  bacYear: "2026",
  bacTrack: "Lettres",
  generalAverage: "14",
  averageType: "official",
  higherEducationStatus: "not_started",
  currentStudyField: "",
  universitySemesters: "",
  studyIntent: "",
  targetSpecialization: "",
  targetDegree: "Bachelor",
  targetField: "Lettres/Langues",
  engineeringSpecialty: "",
  scienceSpecialty: "",
  germanLevel: "B2",
  englishLevel: "B1",
  studyLanguage: "Allemand",
  targetIntakeSeason: "winter",
  targetIntakeYear: "2027",
  budgetRange: "800–1 000 € / mois",
  preferredCities: ["Erlangen"],
  masterSubjectCredits: {},
};

test("candidate sees a factual letter even when the detailed provider returns 503", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "One desktop regression covers provider failure.");
  await page.route(/\/api\/orientation\/engine$/, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Mocked provider outage" }),
    });
  });

  await page.goto("/orientation", { waitUntil: "networkidle" });
  await page.evaluate(({ key, value }) => {
    window.sessionStorage.setItem(key, JSON.stringify({
      identity: {
        firstName: "Candidate",
        lastName: "Example",
        birthDate: "2005-06-15",
        email: "no-real-address@example.test",
      },
      identityComplete: true,
      answers: value,
      step: 5,
    }));
  }, { key: SESSION_KEY, value: answers });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#orientation-report")).toBeVisible();

  await expect(page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" }))
    .toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Universités et formations à découvrir" }))
    .toBeVisible();
  await expect(page.getByText("La recherche d’universités n’a pas pu se terminer.", { exact: false }))
    .toBeVisible();
  await expect(page.getByRole("button", { name: "Réessayer la recherche complémentaire" }))
    .toBeVisible();
  await expect(page.getByText("Votre lettre détaillée est momentanément indisponible", { exact: false }))
    .toHaveCount(0);
});
