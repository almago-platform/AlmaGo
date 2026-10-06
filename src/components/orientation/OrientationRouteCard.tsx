import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import { orientationRouteCopy } from "@/content/orientation-route-copy";
import { buildUniversalOrientationGuidance } from "@/lib/orientation/universal-guidance";

export function OrientationRouteCard({
  answers,
  locale,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
}) {
  const routeCopy = orientationRouteCopy[locale];
  const guidance = buildUniversalOrientationGuidance(answers, locale);

  return (
    <section aria-labelledby="orientation-route-title" className="mt-8">
      <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">{routeCopy.eyebrow}</p>
        <h3 id="orientation-route-title" className="mt-2 text-xl font-bold">
          {guidance.priorityTitle}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
          {guidance.priorityBody}
        </p>

        {guidance.languageChoices.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {guidance.languageChoices.map((choice, index) => (
              <article
                key={choice}
                className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand-strong)]">
                  {index + 1}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{choice}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <p className="eyebrow">
            {{ fr: "Votre projet", ar: "مشروعك", en: "Your project", de: "Dein Vorhaben" }[locale]}
          </p>
          <h3 className="mt-2 text-lg font-bold">{guidance.academicTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{guidance.academicBody}</p>
        </article>

        <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <p className="eyebrow">
            {{ fr: "Ville et universités", ar: "المدينة والجامعات", en: "City and universities", de: "Stadt und Hochschulen" }[locale]}
          </p>
          <h3 className="mt-2 text-lg font-bold">{guidance.cityTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{guidance.cityBody}</p>
        </article>
      </div>

      <article className="mt-5 rounded-[var(--radius-panel)] border border-[var(--warning-border)] bg-[var(--premium-gold-wash)] p-5 sm:p-6">
        <p className="eyebrow">
          {{ fr: "En parallèle", ar: "بالتوازي", en: "In parallel", de: "Parallel" }[locale]}
        </p>
        <h3 className="mt-2 text-lg font-bold">{guidance.parallelTitle}</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{guidance.parallelBody}</p>
      </article>

      <div className="mt-5 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">
          {{ fr: "Votre plan", ar: "خطتك", en: "Your plan", de: "Dein Plan" }[locale]}
        </p>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            guidance.timeline.now,
            guidance.timeline.next,
            guidance.timeline.then,
            guidance.timeline.afterAdmission,
          ].map((step, index) => (
            <li
              key={step}
              className="flex gap-3 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4"
            >
              <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--foreground)] px-2 text-xs font-bold text-white">
                {index + 1}
              </span>
              <p className="text-sm leading-6 text-[var(--foreground)]">{step}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 rounded-[var(--radius-panel)] border-2 border-[var(--brand)] bg-[var(--surface)] p-5 sm:p-6">
        <p className="eyebrow">
          {{ fr: "Prochaine étape", ar: "الخطوة التالية", en: "Next step", de: "Nächster Schritt" }[locale]}
        </p>
        <h3 className="mt-2 text-lg font-bold">{guidance.ctaTitle}</h3>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
          {guidance.ctaBody}
        </p>
      </div>

      <p className="mt-4 text-xs leading-5 text-[var(--foreground)]">
        {routeCopy.note}
      </p>
    </section>
  );
}
