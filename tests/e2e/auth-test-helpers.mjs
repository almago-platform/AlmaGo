import { expect } from "@playwright/test";

const invalidCredentialsMessage = "Email ou mot de passe incorrect.";

function expectedAreaPattern(expectedArea) {
  return expectedArea === "admin"
    ? /^\/admin(?:\/|$)/
    : /^\/student(?:\/|$)/;
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

export async function loginWithRedactedPassword(
  page,
  email,
  password,
  expectedArea = "student",
) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  const passwordInput = page.getByLabel("Mot de passe");
  await page.getByLabel("Email").fill(email);
  await passwordInput.fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  let state = "pending";
  try {
    await expect
      .poll(() => authState(page, expectedArea), {
        timeout: 20_000,
        message: `Waiting for the dedicated E2E identity to reach /${expectedArea}.`,
      })
      .not.toBe("pending");
    state = await authState(page, expectedArea);
  } finally {
    await passwordInput.fill("").catch(() => null);
  }

  expect(
    state,
    "Dedicated E2E credentials were rejected. Rotate/reset the test-account password and the matching GitHub Actions secret before rerunning A43.",
  ).toBe("authenticated");
}
