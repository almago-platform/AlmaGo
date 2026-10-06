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
      <section className="grid overflow-hidden rounded-[1.35rem] border border-black/[.07] bg-white shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)] lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="p-5 sm:p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[var(--brand)]">
            Campus Allemagne
          </p>
          <h2 className="mt-2 max-w-3xl text-[1.45rem] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {copy.emptyTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.emptyBody}</p>
          <Link
            href="/prospect"
            className="mt-5 inline-flex min-h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#202326] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
          >
            {copy.backToSpace}
          </Link>
        </div>

        <div
          aria-hidden="true"
          className="relative hidden min-h-full overflow-hidden bg-[#17191b] p-5 lg:flex lg:flex-col lg:justify-center"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 10%, rgba(244,180,0,.16), transparent 11rem), radial-gradient(circle at 5% 100%, rgba(216,6,33,.22), transparent 13rem)",
          }}
        >
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_64%,#f4b400_64%_82%,transparent_82%)]" />
          <div className="space-y-3">
            {[1, 2, 3].map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${index === 0 ? "border-white/15 bg-white/[.08]" : "border-white/8 bg-white/[.035]"}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${index === 0 ? "bg-[var(--brand)] text-white" : "bg-white/10 text-white/55"}`}>
                  {step}
                </span>
                <span className="h-2 flex-1 rounded-full bg-white/10">
                  <span className={`block h-full rounded-full ${index === 0 ? "w-3/5 bg-[var(--accent)]" : index === 1 ? "w-2/5 bg-white/18" : "w-1/4 bg-white/12"}`} />
                </span>
              </div>
            ))}
          </div>
        </div>
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
