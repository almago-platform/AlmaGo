import { expect } from "@playwright/test";

const invalidCredentialsMessage = "Email ou mot de passe incorrect.";

async function authState(page) {
  const path = new URL(page.url()).pathname;
  if (/^\/student(?:\/|$)/.test(path)) {
    return "authenticated";
  }

  const rejected = await page
    .getByText(invalidCredentialsMessage, { exact: true })
    .isVisible()
    .catch(() => false);

  return rejected ? "rejected" : "pending";
}

export async function loginWithRedactedPassword(page, email, password) {
  await page.goto("/login", { waitUntil: "networkidle" });

  const passwordInput = page.getByLabel("Mot de passe");
  await page.getByLabel("Email").fill(email);
  await passwordInput.fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();

  let state = "pending";
  try {
    await expect
      .poll(() => authState(page), {
        timeout: 20_000,
        message: "Waiting for the dedicated E2E identity to authenticate.",
      })
      .not.toBe("pending");
    state = await authState(page);
  } finally {
    await passwordInput.fill("").catch(() => null);
  }

  expect(
    state,
    "Dedicated E2E credentials were rejected. Rotate/reset the test-account password and the matching GitHub Actions secret before rerunning A43.",
  ).toBe("authenticated");
}
