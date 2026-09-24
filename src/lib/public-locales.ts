export type PublicLocaleStatus = "ready" | "planned";

export type PublicLocale = {
  code: "fr" | "en" | "de" | "ar";
  label: string;
  htmlLang: string;
  openGraphLocale: string;
  direction: "ltr" | "rtl";
  status: PublicLocaleStatus;
};

export const publicLocales: readonly PublicLocale[] = [
  {
    code: "fr",
    label: "Français",
    htmlLang: "fr",
    openGraphLocale: "fr_FR",
    direction: "ltr",
    status: "ready",
  },
  {
    code: "en",
    label: "English",
    htmlLang: "en",
    openGraphLocale: "en_GB",
    direction: "ltr",
    status: "planned",
  },
  {
    code: "de",
    label: "Deutsch",
    htmlLang: "de",
    openGraphLocale: "de_DE",
    direction: "ltr",
    status: "planned",
  },
  {
    code: "ar",
    label: "العربية",
    htmlLang: "ar",
    openGraphLocale: "ar_AR",
    direction: "rtl",
    status: "planned",
  },
] as const;

export const defaultPublicLocale = publicLocales[0];

export function readyPublicLocales() {
  return publicLocales.filter((locale) => locale.status === "ready");
}
