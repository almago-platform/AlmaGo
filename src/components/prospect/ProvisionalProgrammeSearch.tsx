"use client";

import { useMemo, useState } from "react";
import { provisionalCopy } from "@/content/prospect-provisional-copy";
import type { Locale } from "@/lib/i18n";

export type ProvisionalProgramme = {
  id: string;
  name: string;
  university: string;
  city: string;
  field: string;
  degree: string;
  language: string;
  officialUrl: string | null;
  recommended: boolean;
};

export function ProvisionalProgrammeSearch({
  items,
  locale,
}: {
  items: ProvisionalProgramme[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const t = provisionalCopy[locale];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.name, item.university, item.city, item.field, item.degree]
        .some((value) => value.toLocaleLowerCase().includes(normalized)),
    );
  }, [items, query]);

  return (
    <section id="programmes" className="pc-panel p-5 sm:p-7">
      <h2 className="text-2xl font-bold text-[var(--foreground)]">{t.programmes}</h2>
      {items.length ? (
        <>
          <label className="mt-4 block text-sm font-semibold text-[var(--foreground)]">
            {t.search}
            <input
              type="search"
              className="field mt-2 min-h-12 w-full"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.search}
              autoComplete="off"
            />
          </label>
          {filtered.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2" aria-live="polite">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <h3 className="text-base font-bold text-[var(--foreground)]">{item.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{item.university}{item.city ? ` · ${item.city}` : ""}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">{[item.degree, item.field, item.language].filter(Boolean).join(" · ")}</p>
                  {item.officialUrl ? (
                    <a
                      href={item.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      referrerPolicy="no-referrer"
                      className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--brand)] underline underline-offset-4"
                    >
                      {t.official} ↗
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : <p role="status" className="mt-4 text-sm">{t.noMatch}</p>}
        </>
      ) : <p className="mt-4 text-sm text-[var(--muted)]">{t.catalogueEmpty}</p>}
    </section>
  );
}
