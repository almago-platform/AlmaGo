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
      {!compact && (
        <span className="sr-only">{copy.common.language}</span>
      )}
      <select
        aria-label={copy.common.language}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="min-h-10 rounded-[var(--radius-control)] border border-[var(--border,#d9d3c7)] bg-[var(--surface,#fffdf8)] px-2.5 text-xs font-bold text-[var(--foreground,#1c2124)] shadow-sm outline-none transition-colors hover:border-[var(--brand-border,#e9a9b3)] focus-visible:ring-2 focus-visible:ring-[var(--brand,#db0423)]"
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
