export const supportedLocales = ["fr", "ar", "en", "de"] as const;

export type Locale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_COOKIE = "almago_locale";

export const localeLabels: Record<Locale, string> = {
  fr: "FR",
  ar: "العربية",
  en: "EN",
  de: "DE",
};

export const localeLongLabels: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && supportedLocales.includes(value as Locale));
}

export function normalizeLocale(value: string | null | undefined): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeDirection(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function localeOpenGraph(locale: Locale): string {
  return {
    fr: "fr_FR",
    ar: "ar_TN",
    en: "en_GB",
    de: "de_DE",
  }[locale];
}
