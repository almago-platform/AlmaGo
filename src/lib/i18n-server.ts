import "server-only";

import { cookies } from "next/headers";
import { getNativeCopy } from "@/content/native-copy";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";

export async function getRequestLocale() {
  const store = await cookies();
  return normalizeLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getRequestCopy() {
  const locale = await getRequestLocale();
  return { locale, copy: getNativeCopy(locale) };
}
