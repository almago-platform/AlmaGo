export function hasAdminAuthenticatorAssurance(
  currentLevel: string | null | undefined,
) {
  return currentLevel === "aal2";
}
