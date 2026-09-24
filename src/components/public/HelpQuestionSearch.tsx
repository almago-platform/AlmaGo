"use client";

import { useMemo, useState } from "react";

type HelpQuestionGroup = {
  category: string;
  items: readonly {
    q: string;
    a: string;
  }[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();
}

export function HelpQuestionSearch({
  groups,
}: Readonly<{
  groups: readonly HelpQuestionGroup[];
}>) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return groups;

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          normalize(`${item.q} ${item.a} ${group.category}`).includes(normalizedQuery),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, normalizedQuery]);

  const resultCount = filtered.reduce((total, group) => total + group.items.length, 0);

  return (
    <>
      <div className="mt-8 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/35 p-4 sm:p-5">
        <label htmlFor="help-search" className="block text-sm font-bold text-slate-900">
          Rechercher dans le Centre d’aide
        </label>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Essayez par exemple : document, admission, échéance, traduction ou programme.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="help-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Que souhaitez-vous comprendre ?"
            autoComplete="off"
            className="field min-h-12 flex-1 bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-4 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
            >
              Effacer
            </button>
          )}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500" aria-live="polite">
          {normalizedQuery
            ? `${resultCount} réponse${resultCount > 1 ? "s" : ""} correspondante${resultCount > 1 ? "s" : ""}`
            : `${resultCount} réponses disponibles`}
        </p>
      </div>

      {filtered.length ? (
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
          {filtered.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`help-${group.category.replace(/\s+/g, "-").toLowerCase()}`}
              className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-5 sm:p-6"
            >
              <h3
                id={`help-${group.category.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-xl font-bold tracking-tight text-slate-950"
              >
                {group.category}
              </h3>
              <div className="mt-4 divide-y divide-[var(--border)]">
                {group.items.map((item) => (
                  <details key={item.q} className="group">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
                      <span>{item.q}</span>
                      <span
                        aria-hidden="true"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="pb-4 pr-10 text-sm leading-6 text-slate-600">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div
          role="status"
          className="mt-7 rounded-[var(--radius-panel)] border border-dashed border-[var(--brand-border)] bg-[#fbfaf8] p-6 text-center"
        >
          <h3 className="font-bold text-slate-950">Aucune réponse ne correspond à cette recherche.</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Essayez un terme plus simple ou effacez la recherche pour retrouver toutes les questions.
          </p>
          <button
            type="button"
            onClick={() => setQuery("")}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
          >
            Voir toutes les questions
          </button>
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-slate-500">
        La recherche filtre uniquement les réponses affichées sur cette page. Elle n’est pas envoyée à un service externe.
      </p>
    </>
  );
}
