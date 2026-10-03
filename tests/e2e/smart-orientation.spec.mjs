import { mkdirSync, writeFileSync } from "node:fs";
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

    await expect(page.locator("#smart-orientation-title")).toHaveCount(0);
    await expect(page.locator("#orientation-route-title")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" })).toBeVisible();
    await expect(page.getByText("Voir les réponses utilisées")).toBeVisible();
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
    await expect(page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" })).toBeVisible();
    await expect(page.getByText(/trop tôt/i)).toHaveCount(0);
    await expect(page.getByText("Pour quelle rentrée souhaitez-vous commencer ?")).toHaveCount(0);
    await expect(page.locator("#smart-orientation-title")).toHaveCount(0);
    await expect(page.locator("#orientation-route-title")).toHaveCount(0);
    await expect(page.getByText("Les options détaillées sont momentanément indisponibles", { exact: false })).toHaveCount(0);

    await showResult(page, baseAnswers({
      generalAverage: "10",
      targetField: "Économie/Gestion",
    }));
    await expect(page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" })).toBeVisible();
    await expect(page.locator("#smart-orientation-title")).toHaveCount(0);

    await showResult(page, baseAnswers({
      generalAverage: "",
      averageType: "",
      targetField: "Ingénierie",
      engineeringSpecialty: "computer_engineering",
    }));
    await expect(page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" })).toBeVisible();

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
    await expect(page.getByRole("heading", { name: "توجيهك للدراسة في ألمانيا" })).toBeVisible();
    await expect(page.locator("#smart-orientation-title")).toHaveCount(0);
    await expect(page.locator("#orientation-route-title")).toHaveCount(0);
    await assertNoSeriousA11y(page);
    await assertNoOverflow(page);

    await page.screenshot({
      path: "artifacts/smart-orientation/arabic-mobile-360.png",
      fullPage: true,
    });
  });

  test("Orientation V4 live matrix returns candidate results before a posteriori admin audit", async ({ page, browser, request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop-chromium", "The live provider/admin matrix runs once on desktop.");
    test.skip(!adminConfigured, "Dedicated admin E2E identity is required.");
    test.setTimeout(1_200_000);

    const primary = baseAnswers({
      bacYear: "2026",
      generalAverage: "15",
      targetField: "Informatique",
      germanLevel: "A2",
      studyLanguage: "Allemand",
      targetIntakeSeason: "winter",
      targetIntakeYear: "2027",
    });

    const matrix = [
      ["bac_obtained_a2", primary],
      ["bac_preparing_no_german", baseAnswers({
        bacStatus: "preparing",
        bacYear: "2027",
        generalAverage: "14",
        averageType: "current_estimate",
        targetField: "Informatique",
        germanLevel: "none",
        studyLanguage: "Allemand",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["b2_application_work", baseAnswers({
        generalAverage: "16",
        targetField: "Informatique",
        germanLevel: "B2",
        studyLanguage: "Allemand",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["very_limited_budget", baseAnswers({
        targetField: "Informatique",
        germanLevel: "B1",
        budgetRange: "Moins de 800 € / mois",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["fixed_city_berlin", baseAnswers({
        targetField: "Informatique",
        germanLevel: "B2",
        preferredCities: ["Berlin"],
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["undecided_engineering", baseAnswers({
        targetField: "Ingénierie",
        engineeringSpecialty: "undecided",
        germanLevel: "A2",
        studyLanguage: "À définir",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["automotive", baseAnswers({
        bacTrack: "Sciences techniques",
        targetField: "Ingénierie",
        engineeringSpecialty: "automotive",
        germanLevel: "B1",
        studyLanguage: "Allemand",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["computer_engineering", baseAnswers({
        bacTrack: "Sciences techniques",
        targetField: "Ingénierie",
        engineeringSpecialty: "computer_engineering",
        germanLevel: "B2",
        studyLanguage: "Allemand et anglais",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["architecture", baseAnswers({
        targetField: "Architecture",
        engineeringSpecialty: "",
        germanLevel: "B1",
        studyLanguage: "Allemand",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["no_bac_fallback", baseAnswers({
        bacStatus: "no_bac",
        bacYear: "",
        bacTrack: "",
        generalAverage: "",
        averageType: "",
        lastDiploma: "secondary_other",
        targetField: "Informatique",
        germanLevel: "none",
        studyLanguage: "À définir",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
      ["no_reliable_programme_probe", baseAnswers({
        targetField: "other",
        engineeringSpecialty: "",
        germanLevel: "A1",
        studyLanguage: "À définir",
        preferredCities: ["Iéna"],
        targetIntakeSeason: "summer",
        targetIntakeYear: "2027",
      })],
      ["studienkolleg_sensitive_probe", baseAnswers({
        bacTrack: "Lettres",
        generalAverage: "12",
        targetField: "Architecture",
        engineeringSpecialty: "",
        germanLevel: "none",
        studyLanguage: "Allemand",
        budgetRange: "Moins de 800 € / mois",
        targetIntakeSeason: "winter",
        targetIntakeYear: "2027",
      })],
    ];

    const summaries = [];
    let primaryPayload = null;

    // Every candidate result is obtained before any admin session exists.
    for (const [label, answers] of matrix) {
      const startedAt = Date.now();
      const response = await request.post("/api/orientation/engine", {
        data: { locale: "fr", answers },
        timeout: 90_000,
      });
      const body = await response.json();

      expect(response.status(), label).toBe(200);
      expect(body.engine, label).toBeTruthy();
      expect(body.letter, label).toBeTruthy();
      expect(body, label).not.toHaveProperty("pending_admin_approval");

      if (body.personalized) {
        expect(body.personalized.humanReview, label).toEqual({
          mode: "post_result_audit",
          blocksResult: false,
        });
        expect(body.personalized, label).not.toHaveProperty("pending_admin_approval");
      }

      const summary = {
        label,
        httpStatus: response.status(),
        durationMs: Date.now() - startedAt,
        personalizedStatus: body.personalized?.status || null,
        selectedCount: body.personalized?.selected?.length || 0,
        reviewPersisted: Boolean(body.personalized?.reviewId),
        reviewIdPrefix: body.personalized?.reviewId
          ? String(body.personalized.reviewId).slice(0, 8)
          : null,
        postResultAudit: body.personalized?.humanReview?.mode === "post_result_audit",
        blocksResult: body.personalized?.humanReview?.blocksResult ?? null,
        studienkollegObserved: Boolean(
          body.personalized?.selected?.some((option) =>
            option.facts?.some((fact) =>
              fact.field === "studienkolleg_requirement"
              && fact.value === true
            )
          )
        ),
      };
      summaries.push(summary);

      if (label === "bac_obtained_a2") {
        primaryPayload = body;
      }
    }

    // Browser proof comes before any admin session or runtime configuration check:
    // the candidate result must never depend on Phase F audit availability.
    await showResult(page, primary);
    await expect(
      page.getByRole("heading", { name: "Votre orientation pour étudier en Allemagne" }),
    ).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/attente.*admin|approbation.*admin/i)).toHaveCount(0);

    if ((primaryPayload?.personalized?.selected?.length || 0) > 0) {
      await expect(page.getByText("Programmes sélectionnés pour votre projet")).toBeVisible();
      await expect(page.getByText("Votre prochaine étape")).toBeVisible();
      await expect(page.getByText("Votre rôle, notre accompagnement")).toBeVisible();
      await expect(page.getByText("Campus Allemagne coordonne votre parcours")).toBeVisible();
      await expect(page.getByText("Voir les informations vérifiées et les sources officielles")).toBeVisible();
    }

    const candidateTextBeforeAudit = await page.locator("#orientation-report").innerText();
    expect(candidateTextBeforeAudit.length).toBeGreaterThan(100);

    // Only now does an admin session start. Runtime diagnostics expose presence/flags
    // as booleans only — never key values — so live failures are actionable without
    // weakening the server-only secret boundary.
    const adminContext = await browser.newContext({
      baseURL: process.env.ALMAGO_BASE_URL || "http://127.0.0.1:3000",
    });
    const adminPage = await adminContext.newPage();
    let runtime = null;
    let immediateReviewPrefix = null;

    try {
      await loginWithRedactedPassword(
        adminPage,
        adminEmail,
        adminPassword,
        "admin",
      );

      const runtimeResponse = await adminPage.request.get(
        "/api/admin/orientation/runtime",
      );
      expect(runtimeResponse.status()).toBe(200);
      runtime = await runtimeResponse.json();

      // Persist evidence before asserting provider configuration so a failing run
      // records exactly which non-secret activation boundary is missing.
      writeFileSync(
        "artifacts/smart-orientation/orientation-v4-live-matrix.json",
        JSON.stringify({
          candidateResultBeforeAdmin: true,
          runtime,
          postResultAuditCompleted: false,
          cases: summaries,
        }, null, 2),
      );

      expect(runtime.supabase?.urlPresent, JSON.stringify(runtime)).toBe(true);
      expect(runtime.supabase?.secretKeyPresent, JSON.stringify(runtime)).toBe(true);
      expect(runtime.supabase?.configured, JSON.stringify(runtime)).toBe(true);
      expect(runtime.discovery?.configured, JSON.stringify(runtime)).toBe(true);
      expect(runtime.verification?.configured, JSON.stringify(runtime)).toBe(true);
      expect(runtime.writer?.configured, JSON.stringify(runtime)).toBe(true);

      expect(primaryPayload?.personalized?.reviewId).toBeTruthy();
      const immediateReviewId = String(primaryPayload.personalized.reviewId);
      immediateReviewPrefix = immediateReviewId.slice(0, 8);

      const adminResponse = await adminPage.goto("/admin/orientation", {
        waitUntil: "networkidle",
      });
      expect(adminResponse?.ok()).toBeTruthy();
      await expect(
        adminPage.getByRole("heading", { name: "Audits Orientation V4 a posteriori" }),
      ).toBeVisible();

      const reviewCard = adminPage
        .locator("article")
        .filter({ hasText: immediateReviewPrefix })
        .first();
      await expect(reviewCard).toBeVisible();
      await expect(reviewCard.getByText(/A — candidats découverts/)).toBeVisible();
      await expect(reviewCard.getByText(/B — faits vérifiés/)).toBeVisible();
      await expect(reviewCard.getByText(/C — shortlist déterministe/)).toBeVisible();
      await expect(reviewCard.getByText(/D — texte généré/)).toBeVisible();

      await reviewCard.locator("textarea").fill(
        "E2E Phase F — audit a posteriori: correction demandée sur une revue synthétique de validation.",
      );
      await reviewCard.getByRole("button", { name: "Demander correction" }).click();
      await adminPage.waitForLoadState("networkidle");

      const updatedReviewCard = adminPage
        .locator("article")
        .filter({ hasText: immediateReviewPrefix })
        .first();
      await expect(updatedReviewCard.getByText("Corrections demandées")).toBeVisible();
    } finally {
      await adminContext.close();
    }

    // The already-delivered candidate result remains present after the later admin audit.
    await expect(page.locator("#orientation-report")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Par où commencer pour étudier en Allemagne ?" })).toHaveCount(0);
    await expect(page.getByRole("progressbar")).toHaveCount(0);
    const candidateTextAfterAudit = await page.locator("#orientation-report").innerText();
    expect(candidateTextAfterAudit).toBe(candidateTextBeforeAudit);

    writeFileSync(
      "artifacts/smart-orientation/orientation-v4-live-matrix.json",
      JSON.stringify({
        candidateResultBeforeAdmin: true,
        runtime,
        postResultAuditCompleted: true,
        reviewedIdPrefix: immediateReviewPrefix,
        cases: summaries,
      }, null, 2),
    );
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
