"use client";

import { localeLabels, supportedLocales, type Locale } from "@/lib/i18n";
import { useLocale } from "./LocaleProvider";

export function LanguageSwitcher({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const { locale, setLocale, copy } = useLocale();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      {!compact && <span className="sr-only">{copy.common.language}</span>}
      <select
        aria-label={copy.common.language}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-10 rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-[var(--surface-raised)] px-2.5 text-xs font-semibold text-[var(--foreground)] shadow-[var(--shadow-xs)] outline-none transition-[border-color,box-shadow,background-color] hover:border-[var(--muted)] focus:border-[var(--brand)] focus:shadow-[var(--focus-ring)]"
      >
        {supportedLocales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
