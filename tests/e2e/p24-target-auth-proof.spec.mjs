import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const studentEmail = process.env.ALMAGO_E2E_STUDENT_EMAIL;
const studentPassword = process.env.ALMAGO_E2E_STUDENT_PASSWORD;
const adminEmail = process.env.ALMAGO_E2E_ADMIN_EMAIL;
const adminPassword = process.env.ALMAGO_E2E_ADMIN_PASSWORD;
const runId = process.env.GITHUB_RUN_ID || String(Date.now());

const configured = Boolean(
  supabaseUrl &&
  publishableKey &&
  secretKey &&
  studentEmail &&
  studentPassword &&
  adminEmail &&
  adminPassword,
);

const adminClient = configured
  ? createClient(supabaseUrl, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    })
  : null;

const disposableEmail =
  `phase2.p24.${runId}-${crypto.randomBytes(4).toString("hex")}@almago.test`;
const disposablePassword = `P24-${crypto.randomBytes(16).toString("hex")}Aa1!`;
const resetPassword = `P24R-${crypto.randomBytes(16).toString("hex")}Aa1!`;

const orientationIds = new Set();
const prospectIds = new Set();
let disposableUserId = null;

function answers() {
  return {
    bacStatus: "obtained",
    bacYear: "2026",
    bacTrack: "Mathématiques",
    generalAverage: "14.50",
    lastDiploma: "Baccalauréat",
    targetDegree: "Bachelor",
    targetField: "Informatique",
    germanLevel: "B1",
    englishLevel: "B2",
    studyLanguage: "Allemand",
    budgetRange: "800–1 000 € / mois",
    preferredCities: ["Aachen"],
  };
}

async function captureOrientation(request, email) {
  const response = await request.post("/api/orientation/prospect", {
    data: {
      email,
      locale: "fr",
      privacyAcknowledged: true,
      answers: answers(),
    },
  });
  expect(response.status()).toBe(201);
  const payload = await response.json();
  expect(payload.saved).toBe(true);
  expect(payload.delivery).toBe("disabled");
  expect(payload.e2eResumeToken).toMatch(/^[A-Za-z0-9_-]{43}$/);
  expect(payload.e2eOrientationId).toMatch(/^[0-9a-f-]{36}$/);
  orientationIds.add(payload.e2eOrientationId);

  const { data: orientation, error } = await adminClient
    .from("orientations")
    .select("prospect_id")
    .eq("id", payload.e2eOrientationId)
    .single();
  expect(error).toBeNull();
  prospectIds.add(orientation.prospect_id);

  return {
    token: payload.e2eResumeToken,
    orientationId: payload.e2eOrientationId,
    prospectId: orientation.prospect_id,
  };
}

async function login(page, email, password, token = null) {
  const suffix = token ? `?orientation_token=${encodeURIComponent(token)}` : "";
  await page.goto(`/login${suffix}`, { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-auth-ready="true"]')).toBeVisible({ timeout: 20_000 });

  const emailInput = page.locator('input[type="email"]');
  if (token) {
    await expect(emailInput).toHaveValue(email);
    await expect(emailInput).toHaveAttribute("readonly", "");
  } else {
    await emailInput.fill(email);
  }

  await page.locator('input[autocomplete="current-password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  if (token) {
    await expect(page.locator('a[href="/prospect"]')).toBeVisible({ timeout: 25_000 });
  }
}

function proofTokenHash(linkData) {
  const properties = linkData?.properties || {};
  if (typeof properties.hashed_token === "string" && properties.hashed_token) {
    return properties.hashed_token;
  }
  const actionLink = properties.action_link;
  if (typeof actionLink === "string" && actionLink) {
    const parsed = new URL(actionLink);
    return parsed.searchParams.get("token_hash") || parsed.searchParams.get("token");
  }
  return null;
}

async function verifyProofLink(page, { tokenHash, type, next }) {
  const url = new URL("/e2e/p24-confirm", "http://127.0.0.1:3000");
  url.searchParams.set("token_hash", tokenHash);
  url.searchParams.set("type", type);
  url.searchParams.set("next", next);
  await page.goto(url.pathname + url.search, { waitUntil: "domcontentloaded" });
}

async function cleanup() {
  if (!adminClient) return;

  for (const id of orientationIds) {
    await adminClient.from("orientations").delete().eq("id", id);
  }

  for (const id of prospectIds) {
    await adminClient.from("prospects").delete().eq("id", id);
  }

  if (disposableUserId) {
    await adminClient.auth.admin.deleteUser(disposableUserId).catch(() => null);
  }
}

test.describe("P2.4 real Supabase/Auth closure proof", () => {
  test.setTimeout(120_000);
  test.skip(!configured, "P2.4 proof requires Supabase server key plus dedicated E2E identities.");

  test.afterAll(async () => {
    await cleanup();
  });

  test("existing account claims idempotently and a different authenticated user is rejected", async ({ page, request }) => {
    const fixture = await captureOrientation(request, studentEmail);

    await login(page, studentEmail, studentPassword, fixture.token);

    const repeated = await page.request.post("/api/orientation/claim", {
      data: { token: fixture.token },
    });
    expect(repeated.status()).toBe(200);
    expect(await repeated.json()).toEqual({ linked: true });

    const { data: prospect, error: prospectError } = await adminClient
      .from("prospects")
      .select("id,user_id")
      .eq("id", fixture.prospectId)
      .single();
    expect(prospectError).toBeNull();
    expect(prospect.user_id).toMatch(/^[0-9a-f-]{36}$/);

    const { data: studentUser, error: studentUserError } =
      await adminClient.auth.admin.getUserById(prospect.user_id);
    expect(studentUserError).toBeNull();
    expect(studentUser.user?.email?.toLowerCase()).toBe(studentEmail.toLowerCase());

    const { count, error: countError } = await adminClient
      .from("prospects")
      .select("id", { count: "exact", head: true })
      .ilike("email", studentEmail);
    expect(countError).toBeNull();
    expect(count).toBe(1);

    await page.context().clearCookies();
    await login(page, adminEmail, adminPassword);
    await page.waitForURL(/\/admin(?:\/|$)/, { timeout: 20_000 });

    const rejected = await page.request.post("/api/orientation/claim", {
      data: { token: fixture.token },
    });
    expect(rejected.status()).toBe(409);

    const { data: unchanged } = await adminClient
      .from("prospects")
      .select("user_id")
      .eq("id", fixture.prospectId)
      .single();
    expect(unchanged.user_id).toBe(prospect.user_id);
  });

  test("signup confirmation creates a free prospect account and password recovery preserves claim context", async ({ page, request }) => {
    const signupFixture = await captureOrientation(request, disposableEmail);

    await page.goto(`/signup?orientation_token=${encodeURIComponent(signupFixture.token)}`);
    const signupEmail = page.locator('input[type="email"]');
    await expect(signupEmail).toHaveValue(disposableEmail);
    await expect(signupEmail).toHaveAttribute("readonly", "");

    const { data: signupLink, error: signupError } = await adminClient.auth.admin.generateLink({
      type: "signup",
      email: disposableEmail,
      password: disposablePassword,
      options: { data: { full_name: "P2.4 E2E" } },
    });
    expect(signupError).toBeNull();
    const signupTokenHash = proofTokenHash(signupLink);
    expect(signupTokenHash).toBeTruthy();

    disposableUserId = signupLink.user?.id || null;

    await page.context().clearCookies();
    await verifyProofLink(page, {
      tokenHash: signupTokenHash,
      type: "signup",
      next: `/orientation/claim/${signupFixture.token}`,
    });
    await expect(page.locator('a[href="/prospect"]')).toBeVisible({ timeout: 25_000 });

    expect(disposableUserId).toBeTruthy();

    const { data: freeProspect, error: freeProspectError } = await adminClient
      .from("prospects")
      .select("id,user_id")
      .eq("id", signupFixture.prospectId)
      .single();
    expect(freeProspectError).toBeNull();
    expect(freeProspect.user_id).toBe(disposableUserId);

    const { data: access, error: accessError } = await adminClient
      .from("customer_access")
      .select("status")
      .eq("user_id", disposableUserId)
      .single();
    expect(accessError).toBeNull();
    expect(access.status).toBe("prospect_account");

    await page.goto("/prospect");
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 20_000 });
    expect(new URL(page.url()).pathname).toMatch(/^\/prospect(?:\/|$)/);

    const recoveryFixture = await captureOrientation(request, disposableEmail);
    const { data: recoveryLink, error: recoveryError } = await adminClient.auth.admin.generateLink({
      type: "recovery",
      email: disposableEmail,
    });
    expect(recoveryError).toBeNull();

    const recoveryTokenHash = proofTokenHash(recoveryLink);
    expect(recoveryTokenHash).toBeTruthy();

    await page.context().clearCookies();
    await verifyProofLink(page, {
      tokenHash: recoveryTokenHash,
      type: "recovery",
      next: `/reset-password?orientation_token=${encodeURIComponent(recoveryFixture.token)}`,
    });

    await expect(page).toHaveURL(/\/reset-password\?orientation_token=/);
    await page.locator('input[autocomplete="new-password"]').fill(resetPassword);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('a[href="/prospect"]')).toBeVisible({ timeout: 25_000 });

    const publicClient = createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const { data: resetLogin, error: resetLoginError } = await publicClient.auth.signInWithPassword({
      email: disposableEmail,
      password: resetPassword,
    });
    expect(resetLoginError).toBeNull();
    expect(resetLogin.user?.id).toBe(disposableUserId);
    await publicClient.auth.signOut();

    const repeatedAfterReset = await page.request.post("/api/orientation/claim", {
      data: { token: recoveryFixture.token },
    });
    expect(repeatedAfterReset.status()).toBe(200);
  });
});
