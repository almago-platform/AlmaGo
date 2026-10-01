"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { smartOrientationCopy } from "@/content/smart-orientation-copy";
import type { SmartOrientationPriorityResult } from "@/lib/phase2/smart-orientation";

export function SmartOrientationResultCard({
  result,
  prospectCaptureEnabled = false,
}: {
  result: SmartOrientationPriorityResult;
  prospectCaptureEnabled?: boolean;
}) {
  const { locale } = useLocale();
  const copy = smartOrientationCopy[locale];
  const stateCopy = copy.states[result.state];
  const languagePreparation = result.reasonCodes.includes(
    "language_preparation_needed",
  );

  return (
    <section
      aria-labelledby="smart-orientation-title"
      className="mt-8 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h3 id="smart-orientation-title" className="mt-2 text-xl font-bold">
            {stateCopy.title}
          </h3>
        </div>
        <span className="status-badge bg-[var(--surface)] text-[var(--foreground)]">
          {stateCopy.label}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
        {stateCopy.body}
      </p>

      {languagePreparation ? (
        <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">
          {copy.languagePreparation}
        </p>
      ) : null}

      {result.requiresHumanReview ? (
        <div className="mt-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm leading-6">
          {copy.humanReview}
        </div>
      ) : null}

      {prospectCaptureEnabled ? (
        <a
          href="#orientation-prospect-capture"
          className="orientation-print-hide mt-5 inline-flex rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
        >
          {stateCopy.cta}
        </a>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--foreground)]">
        {copy.disclaimer}
      </p>
    </section>
  );
}
