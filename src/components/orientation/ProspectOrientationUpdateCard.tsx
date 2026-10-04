"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
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

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "orientation update failed",
        );
      }

      setState("success");
      router.replace("/prospect/orientation?updated=1");
      router.refresh();
    } catch {
      setState("error");
    }
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
