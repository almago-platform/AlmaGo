"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectOrientationUpdateCopy } from "@/content/prospect-orientation-update-copy";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";

export function ProspectOrientationUpdateCard({
  answers,
}: {
  answers: PublicOrientationAnswers;
}) {
  const { locale } = useLocale();
  const copy = prospectOrientationUpdateCopy[locale];
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");

  async function save() {
    if (state === "saving") return;
    setState("saving");

    try {
      const response = await fetch("/api/prospect/orientation", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers, locale }),
      });

      if (!response.ok) throw new Error("orientation update failed");
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <section className="orientation-print-hide mt-7 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h3 className="mt-2 text-lg font-bold">{copy.successTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.successText}</p>
        <Link
          href="/prospect"
          className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white"
        >
          {copy.returnSpace}
        </Link>
      </section>
    );
  }

  return (
    <section className="orientation-print-hide mt-7 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h3 className="mt-2 text-lg font-bold">{copy.title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.text}</p>

      {state === "error" ? (
        <p role="alert" className="mt-4 rounded-[var(--radius-control)] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {copy.error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white disabled:cursor-wait disabled:opacity-60"
      >
        {state === "saving" ? copy.saving : copy.save}
      </button>
    </section>
  );
}
