"use client";

import Link from "next/link";
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
      <section className="rounded-[1.35rem] border border-black/[.07] bg-white p-6 shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)]">
        <h2 className="text-xl font-bold text-[var(--foreground)]">{copy.emptyTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.emptyBody}</p>
        <Link
          href="/prospect"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
        >
          {copy.backToSpace}
        </Link>
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
              "relative overflow-hidden rounded-[1.4rem] border bg-white p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,.38)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_76px_-42px_rgba(0,0,0,.46)] sm:p-6 " +
              (selected ? "border-[var(--brand)] ring-4 ring-[var(--brand-soft)]" : "border-black/[.07]")
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

            <div className="mt-6 border-t border-black/[.06] pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{copy.price}</p>
              <p className="mt-1 text-[2rem] font-semibold tracking-[-0.04em] text-[#17191b]">
                <bdi dir="auto">{offer.priceLabel}</bdi>
              </p>
            </div>

            <button
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(selected ? null : offer.id)}
              className={
                "mt-6 min-h-11 w-full rounded-xl px-4 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-px " +
                (selected
                  ? "border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-none"
                  : "bg-[var(--brand)] text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] hover:bg-[var(--brand-strong)]")
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
