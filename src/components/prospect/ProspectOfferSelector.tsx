"use client";

import { useState } from "react";
import type { ProspectOffersCopy } from "@/content/prospect-offers-copy";

export type PublishedOfferCard = {
  id: string;
  code: "bronze" | "silver" | "gold";
  displayName: string;
  summary: string;
  services: string[];
  priceLabel: string;
};

export function ProspectOfferSelector({
  offers,
  copy,
}: Readonly<{
  offers: PublishedOfferCard[];
  copy: ProspectOffersCopy;
}>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!offers.length) {
    return (
      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[var(--foreground)]">{copy.emptyTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.emptyBody}</p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {offers.map((offer) => {
        const selected = selectedId === offer.id;

        return (
          <article
            key={offer.id}
            className={
              "rounded-[var(--radius-panel)] border bg-[var(--surface)] p-5 sm:p-6 " +
              (selected ? "border-[var(--brand)] ring-2 ring-[var(--brand-soft)]" : "border-[var(--border)]")
            }
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              {offer.code}
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--foreground)]">{offer.displayName}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{offer.summary}</p>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">
                {copy.services}
              </p>
              <ul className="mt-2 space-y-2 text-sm leading-5 text-[var(--foreground)]">
                {offer.services.map((service) => (
                  <li key={service} className="flex gap-2">
                    <span aria-hidden="true" className="text-[var(--brand)]">✓</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.price}</p>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                <bdi dir="auto">{offer.priceLabel}</bdi>
              </p>
            </div>

            <button
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(selected ? null : offer.id)}
              className={
                "mt-5 min-h-11 w-full rounded-[var(--radius-control)] px-4 text-sm font-bold " +
                (selected
                  ? "border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
                  : "bg-[var(--brand)] text-white")
              }
            >
              {selected ? copy.selected : copy.select}
            </button>

            {selected ? (
              <p role="status" className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {copy.selectionNote}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
