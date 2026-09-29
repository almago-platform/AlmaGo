"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { getNativeCopy } from "@/content/native-copy";
import {
  LOCALE_COOKIE,
  localeDirection,
  type Locale,
} from "@/lib/i18n";

type NativeCopy = ReturnType<typeof getNativeCopy>;

type LocaleContextValue = {
  locale: Locale;
  direction: "ltr" | "rtl";
  copy: NativeCopy;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  initialCopy,
  children,
}: {
  initialLocale: Locale;
  initialCopy: NativeCopy;
  children: ReactNode;
}) {
  const router = useRouter();
  const locale = initialLocale;

  function setLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLocale;
    document.documentElement.dir = localeDirection(nextLocale);
    router.refresh();
  }

  return (
    <LocaleContext.Provider
      value={{
        locale,
        direction: localeDirection(locale),
        copy: initialCopy,
        setLocale,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
