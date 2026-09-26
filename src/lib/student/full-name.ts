export function fullNameUpdate(
  update: Record<string, unknown>,
  current: { first_name: string | null; last_name: string | null },
) {
  const firstNameChanged = Object.hasOwn(update, "first_name");
  const lastNameChanged = Object.hasOwn(update, "last_name");
  if (!firstNameChanged && !lastNameChanged) return {};

  const firstName = firstNameChanged ? update.first_name : current.first_name;
  const lastName = lastNameChanged ? update.last_name : current.last_name;
  return { full_name: `${firstName ?? ""} ${lastName ?? ""}`.trim() };
}
