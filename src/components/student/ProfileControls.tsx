"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import {
  localizePreferredCity,
  localizeProfileOptions,
  studentProfileCopy,
} from "@/content/student-profile-copy";
import { preferredCityOptions, type SelectOption } from "@/lib/student/profile-options";

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return <span>{label}{required ? <span className="text-[var(--accent-strong)]"> *</span> : null}</span>;
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  inputDir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  inputDir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <label className="block text-sm font-medium leading-6 text-slate-700">
      <FieldLabel label={label} required={required} />
      <input
        required={required}
        type={type}
        dir={inputDir}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field"
      />
    </label>
  );
}

export function SelectInput({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
}) {
  const { locale } = useLocale();
  const controls = studentProfileCopy[locale].controls;
  const localizedOptions = localizeProfileOptions(locale, options);
  const hasLegacyValue = value !== "" && !options.some((option) => option.value === value);

  return (
    <label className="block text-sm font-medium leading-6 text-slate-700">
      <FieldLabel label={label} required={required} />
      <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="field">
        <option value="">{controls.choose}</option>
        {hasLegacyValue && <option value={value}>{value} — {controls.updateSuffix}</option>}
        {localizedOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {hasLegacyValue && <span className="mt-1 block text-xs font-normal text-amber-700">{controls.updateWarning}</span>}
    </label>
  );
}

/**
 * Nationality values stay stable for the API, while the visible labels are
 * localized. The list is short enough that a native select is easier to scan
 * than exposing French storage values inside a datalist.
 */
export function SearchableDatalistInput({
  label,
  value,
  onChange,
  options,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
}) {
  const { locale } = useLocale();
  const controls = studentProfileCopy[locale].controls;
  const localizedOptions = localizeProfileOptions(locale, options);
  const hasLegacyValue = value !== "" && !options.some((option) => option.value === value);

  return (
    <label className="block text-sm font-medium leading-6 text-slate-700">
      <FieldLabel label={label} required={required} />
      <select required={required} value={value} onChange={(event) => onChange(event.target.value)} className="field">
        <option value="">{controls.choose}</option>
        {hasLegacyValue && <option value={value}>{value} — {controls.updateSuffix}</option>}
        {localizedOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {hasLegacyValue && <span className="mt-1 block text-xs font-normal text-amber-700">{controls.updateWarning}</span>}
    </label>
  );
}

export function PreferredCitiesPicker({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  const { locale } = useLocale();
  const controls = studentProfileCopy[locale].controls;
  const [query, setQuery] = useState("");

  const cities = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale === "ar" ? "ar" : locale === "de" ? "de-DE" : locale === "en" ? "en-GB" : "fr-FR");
    return preferredCityOptions.filter((city) => {
      if (!normalized) return true;
      return localizePreferredCity(locale, city).toLocaleLowerCase().includes(normalized);
    });
  }, [locale, query]);

  function toggle(city: string) {
    onChange(value.includes(city) ? value.filter((item) => item !== city) : [...value, city]);
  }

  const legacyCities = value.filter((city) => !preferredCityOptions.includes(city as (typeof preferredCityOptions)[number]));

  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-medium text-slate-700"><FieldLabel label={controls.preferredCities} /></legend>
      <input
        value={query}
        dir={locale === "ar" ? "ltr" : undefined}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={controls.citySearch}
        className="field"
      />
      {legacyCities.length > 0 && (
        <div className="mt-2 rounded-[var(--radius-control)] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {controls.legacyCities}:{" "}
          {legacyCities.map((city) => (
            <button type="button" key={city} onClick={() => toggle(city)} className="mx-1 min-h-9 rounded-[var(--radius-control)] bg-white px-2 py-1 underline">
              <bdi dir={locale === "ar" ? "ltr" : undefined}>{city}</bdi> ×
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex max-h-52 flex-wrap gap-2 overflow-y-auto rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-3">
        {cities.map((city) => (
          <button
            type="button"
            key={city}
            onClick={() => toggle(city)}
            aria-pressed={value.includes(city)}
            className={`min-h-10 rounded-[var(--radius-control)] px-3 py-1.5 text-sm font-medium transition-colors ${
              value.includes(city) ? "bg-[var(--brand)] text-white" : "bg-[var(--surface-muted)] text-slate-700 hover:bg-slate-200"
            }`}
          >
            <bdi dir={locale === "ar" ? "ltr" : undefined}>{localizePreferredCity(locale, city)}</bdi>
          </button>
        ))}
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <span>{controls.selection}:</span>
          {value.map((city) => (
            <span
              key={city}
              className="rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              <bdi dir={locale === "ar" ? "ltr" : undefined}>{localizePreferredCity(locale, city)}</bdi>
            </span>
          ))}
        </div>
      )}
    </fieldset>
  );
}
