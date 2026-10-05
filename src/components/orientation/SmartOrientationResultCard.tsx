"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { Badge } from "@/components/ui/Badge";
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
    <section className="orientation-print-hide mt-8 border-y border-[var(--border)] py-6 sm:py-7">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0 max-w-3xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
            {copy.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">
            {stateCopy.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
            {stateCopy.body}
          </p>

          {languagePreparation ? (
            <p className="mt-3 text-sm leading-6 text-[var(--foreground-soft)]">
              {copy.languagePreparation}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <Badge variant={result.requiresHumanReview ? "warning" : "success"}>
            {stateCopy.label}
          </Badge>
          {prospectCaptureEnabled ? (
            <a
              href="#orientation-prospect-capture"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              {stateCopy.cta}
            </a>
          ) : null}
        </div>
      </div>

      {result.requiresHumanReview ? (
        <div className="mt-5 rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--warning-soft)] px-4 py-3 text-sm leading-6 text-[var(--foreground-soft)]">
          {copy.humanReview}
        </div>
      ) : null}

      <p className="mt-5 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--foreground)]">
        {copy.disclaimer}
      </p>
    </section>
  );
}
