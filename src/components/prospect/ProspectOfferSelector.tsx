"use client";

import Link from "next/link";
import { useState } from "react";
import type { ProspectOffersCopy } from "@/content/prospect-offers-copy";
import { PremiumEmptyState } from "@/components/product/PremiumEmptyState";
import { buttonClassName } from "@/components/ui/Button";

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
      <PremiumEmptyState
        eyebrow="Campus Allemagne"
        title={copy.emptyTitle}
        description={copy.emptyBody}
        action={
          <Link href="/prospect" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
            {copy.backToSpace}
          </Link>
        }
      />
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
              "pc-card pc-card-interactive relative overflow-hidden p-5 sm:p-6 " +
              (selected ? "border-[var(--brand)] ring-4 ring-[var(--brand-soft)]" : "")
            }
          >
            <div className={`absolute inset-x-0 top-0 h-[3px] ${offer.code === "gold" ? "bg-[var(--accent)]" : offer.code === "silver" ? "bg-[#73797d]" : "bg-[var(--brand)]"}`} aria-hidden="true" />
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">
              {offer.code}
            </p>
            <h2 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#1c1f21]">{offer.displayName}</h2>
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

            <div className="mt-6 border-t border-[var(--premium-border)] pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.price}</p>
              <p className="mt-1 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--premium-ink)]">
                <bdi dir="auto">{offer.priceLabel}</bdi>
              </p>
            </div>

            <button
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(selected ? null : offer.id)}
              className={
                "pc-button mt-6 min-h-11 w-full px-4 text-sm font-bold shadow-sm " +
                (selected
                  ? "border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-none"
                  : "bg-[var(--brand)] text-white shadow-[var(--premium-shadow-brand)] hover:bg-[var(--brand-strong)]")
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
