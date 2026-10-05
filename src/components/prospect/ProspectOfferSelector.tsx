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

const offerVisual = {
  bronze: {
    accent: "bg-[#9b6a43]",
    ring: "ring-[#9b6a43]/15",
    badge: "bg-[#f6ede6] text-[#704625] ring-[#e7d0bf]",
  },
  silver: {
    accent: "bg-[#7d858d]",
    ring: "ring-[#7d858d]/15",
    badge: "bg-[#f1f3f4] text-[#515960] ring-[#d9dde0]",
  },
  gold: {
    accent: "bg-[var(--accent)]",
    ring: "ring-[var(--accent)]/15",
    badge: "bg-[#fff7dd] text-[#745400] ring-[#ead59a]",
  },
} as const;

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
        <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#202326]">{copy.emptyTitle}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.emptyBody}</p>
        <Link
          href="/prospect"
          className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-black/10 bg-[#f7f4ee] px-4 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:bg-white hover:shadow-md"
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
        const visual = offerVisual[offer.code];

        return (
          <article
            key={offer.id}
            className={
              "group relative overflow-hidden rounded-[1.45rem] border bg-white p-5 shadow-[0_24px_64px_-44px_rgba(0,0,0,.38)] transition-all duration-300 sm:p-6 " +
              (selected
                ? `border-[var(--brand)] ring-4 ${visual.ring} -translate-y-1`
                : "border-black/[.07] hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_34px_78px_-44px_rgba(0,0,0,.48)]")
            }
          >
            <span className={`absolute inset-x-0 top-0 h-[3px] ${visual.accent}`} aria-hidden="true" />
            <div className="flex items-start justify-between gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.13em] ring-1 ring-inset ${visual.badge}`}>
                {offer.code}
              </span>
              {selected ? (
                <span className="rounded-full bg-[var(--brand)] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white">
                  {copy.selected}
                </span>
              ) : null}
            </div>

            <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] text-[#1c1f21]">
              {offer.displayName}
            </h2>
            <p className="mt-2 min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]">{offer.summary}</p>

            <div className="mt-5 border-t border-black/[.06] pt-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#73787c]">
                {copy.services}
              </p>
              <ul className="mt-3 space-y-2.5 text-sm leading-5 text-[#34383b]">
                {offer.services.map((service) => (
                  <li key={service} className="flex gap-2.5">
                    <span aria-hidden="true" className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[11px] font-extrabold text-[var(--brand)]">✓</span>
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 rounded-2xl bg-[#f6f3ed] p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#73787c]">{copy.price}</p>
              <p className="mt-1 text-[1.85rem] font-semibold tracking-[-0.04em] text-[#17191b]">
                <bdi dir="auto">{offer.priceLabel}</bdi>
              </p>
            </div>

            <button
              type="button"
              aria-pressed={selected}
              onClick={() => setSelectedId(selected ? null : offer.id)}
              className={
                "mt-5 min-h-11 w-full rounded-xl px-4 text-sm font-bold shadow-sm transition-all duration-200 " +
                (selected
                  ? "border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] hover:bg-white"
                  : "bg-[var(--brand)] text-white shadow-[0_12px_28px_-16px_rgba(216,6,33,.85)] hover:-translate-y-px hover:bg-[var(--brand-strong)] hover:shadow-md")
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
