import { createHmac } from "node:crypto";
import { expect } from "@playwright/test";

const invalidCredentialsMessage = "Email ou mot de passe incorrect.";

function expectedAreaPattern(expectedArea) {
  if (expectedArea === "admin") return /^\/admin(?:\/|$)/;
  if (expectedArea === "admin-challenge") return /^\/mfa$/;
  return /^\/student(?:\/|$)/;
}

async function authState(page, expectedArea) {
  const path = new URL(page.url()).pathname;
  if (expectedAreaPattern(expectedArea).test(path)) {
    return "authenticated";
  }

  const rejected = await page
    .getByText(invalidCredentialsMessage, { exact: true })
    .isVisible()
    .catch(() => false);

  return rejected ? "rejected" : "pending";
}

function decodeBase32(secret) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const normalized = String(secret || "")
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, "");

  if (!normalized) throw new Error("Missing TOTP secret.");

  let bits = "";
  for (const char of normalized) {
    const value = alphabet.indexOf(char);
    if (value < 0) throw new Error("Invalid TOTP secret.");
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }
  return Buffer.from(bytes);
}

function totpCode(secret, now = Date.now()) {
  const counter = Math.floor(now / 30_000);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac("sha1", decodeBase32(secret))
    .update(message)
    .digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const value =
    (((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff)) %
    1_000_000;

  return String(value).padStart(6, "0");
}

export async function loginWithRedactedPassword(
  page,
  email,
  password,
  expectedArea = "student",
) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await expect(page.locator('form[data-auth-ready="true"]')).toBeVisible({
    timeout: 20_000,
  });

  const passwordInput = page.getByLabel("Mot de passe");
  await page.getByLabel("Email").fill(email);
  await passwordInput.fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  let state = "pending";
  try {
    await expect
      .poll(() => authState(page, expectedArea), {
        timeout: 20_000,
        message: "Waiting for the dedicated E2E identity to reach the expected authenticated boundary.",
      })
      .not.toBe("pending");
    state = await authState(page, expectedArea);
  } finally {
    if (new URL(page.url()).pathname === "/login") {
      await passwordInput.fill("", { timeout: 500 }).catch(() => null);
    }
  }

  expect(
    state,
    "Dedicated E2E credentials were rejected. Rotate/reset the test-account password and the matching GitHub Actions secret before rerunning authenticated E2E.",
  ).toBe("authenticated");

  if (expectedArea !== "admin-challenge") {
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
  }
}

export async function completeAdminMfaChallenge(page, totpSecret) {
  await expect(page).toHaveURL(/\/mfa$/);

  const enrolButton = page.getByRole("button", {
    name: /Configurer une application d.authentification/i,
  });
  if (await enrolButton.isVisible().catch(() => false)) {
    throw new Error(
      "The dedicated admin E2E account has no verified TOTP factor. Enroll it manually once and store the matching seed only in ALMAGO_E2E_ADMIN_TOTP_SECRET.",
    );
  }

  const secondsIntoWindow = Math.floor(Date.now() / 1_000) % 30;
  if (secondsIntoWindow >= 27) {
    await page.waitForTimeout((31 - secondsIntoWindow) * 1_000);
  }

  const input = page.getByLabel("Code temporaire");
  await expect(input).toBeVisible({ timeout: 20_000 });
  await input.fill(totpCode(totpSecret));
  await page.getByRole("button", { name: "Vérifier et ouvrir le cockpit" }).click();

  await page.waitForURL((url) => /^\/admin(?:\/|$)/.test(url.pathname), {
    timeout: 20_000,
  });
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 30_000 });
}
