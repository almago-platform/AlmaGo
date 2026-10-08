/**
 * A single operator must see unassigned dossiers in "Mes dossiers" without
 * silently changing the persisted advisor ownership.
 *
 * The fallback disappears automatically as soon as there is a second admin.
 */
export function isSoloAdmin(
  adminIds: readonly string[],
  currentAdminId: string | null | undefined,
): boolean {
  return Boolean(currentAdminId && adminIds.length === 1 && adminIds[0] === currentAdminId);
}

export function belongsToAdminPortfolio(
  assignedAdminId: string | null | undefined,
  currentAdminId: string | null | undefined,
  soloAdmin: boolean,
): boolean {
  if (!currentAdminId) return false;
  return assignedAdminId === currentAdminId || (soloAdmin && !assignedAdminId);
}
