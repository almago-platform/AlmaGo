import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { ProspectIntakeRecord, StarterDocumentSummary } from "@/lib/prospect/intake";

type JourneyStep = {
  key: string;
  label: string;
  href: string;
};

const journeyCopy: Record<Locale, { count: string; steps: JourneyStep[] }> = {
  fr: {
    count: "étapes",
    steps: [
      { key: "orientation", label: "Orientation", href: "/prospect/orientation" },
      { key: "documents", label: "Documents", href: "/prospect/documents" },
      { key: "review", label: "Analyse Campus", href: "/prospect/proposal" },
      { key: "proposal", label: "Proposition", href: "/prospect/proposal" },
      { key: "payment", label: "Paiement", href: "/prospect/payment" },
      { key: "procedure", label: "Procédure", href: "/prospect/roadmap" },
      { key: "applications", label: "Candidatures", href: "/prospect/roadmap" },
      { key: "admission", label: "Admission", href: "/prospect/roadmap" },
      { key: "visa", label: "Visa & départ", href: "/prospect/roadmap" },
    ],
  },
  ar: {
    count: "خطوات",
    steps: [
      { key: "orientation", label: "التوجيه", href: "/prospect/orientation" },
      { key: "documents", label: "الوثائق", href: "/prospect/documents" },
      { key: "review", label: "مراجعة Campus", href: "/prospect/proposal" },
      { key: "proposal", label: "الاقتراح", href: "/prospect/proposal" },
      { key: "payment", label: "الدفع", href: "/prospect/payment" },
      { key: "procedure", label: "الإجراءات", href: "/prospect/roadmap" },
      { key: "applications", label: "الترشحات", href: "/prospect/roadmap" },
      { key: "admission", label: "القبول", href: "/prospect/roadmap" },
      { key: "visa", label: "التأشيرة والمغادرة", href: "/prospect/roadmap" },
    ],
  },
  en: {
    count: "steps",
    steps: [
      { key: "orientation", label: "Orientation", href: "/prospect/orientation" },
      { key: "documents", label: "Documents", href: "/prospect/documents" },
      { key: "review", label: "Campus review", href: "/prospect/proposal" },
      { key: "proposal", label: "Proposal", href: "/prospect/proposal" },
      { key: "payment", label: "Payment", href: "/prospect/payment" },
      { key: "procedure", label: "Procedure", href: "/prospect/roadmap" },
      { key: "applications", label: "Applications", href: "/prospect/roadmap" },
      { key: "admission", label: "Admission", href: "/prospect/roadmap" },
      { key: "visa", label: "Visa & departure", href: "/prospect/roadmap" },
    ],
  },
  de: {
    count: "Schritte",
    steps: [
      { key: "orientation", label: "Orientierung", href: "/prospect/orientation" },
      { key: "documents", label: "Dokumente", href: "/prospect/documents" },
      { key: "review", label: "Campus-Prüfung", href: "/prospect/proposal" },
      { key: "proposal", label: "Vorschlag", href: "/prospect/proposal" },
      { key: "payment", label: "Zahlung", href: "/prospect/payment" },
      { key: "procedure", label: "Verfahren", href: "/prospect/roadmap" },
      { key: "applications", label: "Bewerbungen", href: "/prospect/roadmap" },
      { key: "admission", label: "Zulassung", href: "/prospect/roadmap" },
      { key: "visa", label: "Visum & Abreise", href: "/prospect/roadmap" },
    ],
  },
};

const preBacJourneyCopy: Record<Locale, { count: string; steps: JourneyStep[] }> = {
  fr: {
    count: "étapes",
    steps: [
      { key: "orientation", label: "Orientation", href: "/prospect/orientation" },
      { key: "pre_bac", label: "Préparation avant le Bac", href: "/prospect/roadmap" },
      { key: "bac_results", label: "Résultats du Bac", href: "/prospect/orientation" },
      { key: "documents", label: "Documents finaux", href: "/prospect/documents" },
      { key: "review", label: "Analyse Campus", href: "/prospect/proposal" },
      { key: "proposal", label: "Proposition", href: "/prospect/proposal" },
      { key: "payment", label: "Paiement", href: "/prospect/payment" },
      { key: "applications", label: "Candidatures", href: "/prospect/roadmap" },
      { key: "admission", label: "Admission", href: "/prospect/roadmap" },
      { key: "visa", label: "Visa & départ", href: "/prospect/roadmap" },
    ],
  },
  ar: {
    count: "خطوات",
    steps: [
      { key: "orientation", label: "التوجيه", href: "/prospect/orientation" },
      { key: "pre_bac", label: "التحضير قبل البكالوريا", href: "/prospect/roadmap" },
      { key: "bac_results", label: "نتائج البكالوريا", href: "/prospect/orientation" },
      { key: "documents", label: "الوثائق النهائية", href: "/prospect/documents" },
      { key: "review", label: "مراجعة Campus", href: "/prospect/proposal" },
      { key: "proposal", label: "الاقتراح", href: "/prospect/proposal" },
      { key: "payment", label: "الدفع", href: "/prospect/payment" },
      { key: "applications", label: "الترشحات", href: "/prospect/roadmap" },
      { key: "admission", label: "القبول", href: "/prospect/roadmap" },
      { key: "visa", label: "التأشيرة والمغادرة", href: "/prospect/roadmap" },
    ],
  },
  en: {
    count: "steps",
    steps: [
      { key: "orientation", label: "Orientation", href: "/prospect/orientation" },
      { key: "pre_bac", label: "Pre-Bac preparation", href: "/prospect/roadmap" },
      { key: "bac_results", label: "Bac results", href: "/prospect/orientation" },
      { key: "documents", label: "Final documents", href: "/prospect/documents" },
      { key: "review", label: "Campus review", href: "/prospect/proposal" },
      { key: "proposal", label: "Proposal", href: "/prospect/proposal" },
      { key: "payment", label: "Payment", href: "/prospect/payment" },
      { key: "applications", label: "Applications", href: "/prospect/roadmap" },
      { key: "admission", label: "Admission", href: "/prospect/roadmap" },
      { key: "visa", label: "Visa & departure", href: "/prospect/roadmap" },
    ],
  },
  de: {
    count: "Schritte",
    steps: [
      { key: "orientation", label: "Orientierung", href: "/prospect/orientation" },
      { key: "pre_bac", label: "Vorbereitung vor dem Abitur", href: "/prospect/roadmap" },
      { key: "bac_results", label: "Abiturergebnisse", href: "/prospect/orientation" },
      { key: "documents", label: "Endgültige Unterlagen", href: "/prospect/documents" },
      { key: "review", label: "Campus-Prüfung", href: "/prospect/proposal" },
      { key: "proposal", label: "Vorschlag", href: "/prospect/proposal" },
      { key: "payment", label: "Zahlung", href: "/prospect/payment" },
      { key: "applications", label: "Bewerbungen", href: "/prospect/roadmap" },
      { key: "admission", label: "Zulassung", href: "/prospect/roadmap" },
      { key: "visa", label: "Visum & Abreise", href: "/prospect/roadmap" },
    ],
  },
};

function currentIndex({
  hasOrientation,
  orientationConfirmed,
  intake,
  starterSummary,
  preBac,
}: {
  hasOrientation: boolean;
  orientationConfirmed: boolean;
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
  preBac?: boolean;
}) {
  if (!hasOrientation || !orientationConfirmed) return 0;

  if (preBac) {
    if (!intake || intake.status === "starter_documents") return 1;
    if (intake.status === "route_proposed" || intake.status === "student_question") return 5;
    if (intake.status === "payment_pending" || intake.status === "paid_pending_validation") return 6;
    if (intake.status === "procedure_created") return 7;
    return 1;
  }

  if (!intake || intake.status === "starter_documents") return 1;
  if (intake.status === "campus_review") return 2;
  if (intake.status === "route_proposed" || intake.status === "student_question") return 3;
  if (intake.status === "payment_pending" || intake.status === "paid_pending_validation") return 4;
  if (intake.status === "procedure_created") return 5;

  if (starterSummary.approved < starterSummary.required) return 1;
  return 2;
}

export function ProspectJourneyProgress(props: {
  hasOrientation: boolean;
  orientationConfirmed: boolean;
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
  locale: Locale;
  compact?: boolean;
  preBac?: boolean;
}) {
  const copy = props.preBac ? preBacJourneyCopy[props.locale] : journeyCopy[props.locale];
  const steps = copy.steps;
  const activeIndex = currentIndex(props);
  const currentStepNumber = Math.min(steps.length, activeIndex + 1);
  const percent = Math.round((currentStepNumber / steps.length) * 100);
  const positionLabel = {
    fr: `Étape ${currentStepNumber} sur ${steps.length}`,
    ar: `الخطوة ${currentStepNumber} من ${steps.length}`,
    en: `Step ${currentStepNumber} of ${steps.length}`,
    de: `Schritt ${currentStepNumber} von ${steps.length}`,
  }[props.locale];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-[var(--foreground)]">
          {positionLabel}
        </span>
        <span className="rounded-full bg-[var(--premium-ink)] px-2.5 py-1 text-[11px] font-bold tabular-nums text-white">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--premium-cream-strong)]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),#f03248)] shadow-[0_0_16px_rgba(216,6,33,.18)] transition-[width] duration-500"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>

      <div
        className={`mt-5 overflow-x-auto rounded-[1.3rem] border border-[var(--premium-border)] bg-white/70 ${props.compact ? "px-2 py-3" : "px-3 py-4 sm:px-4"} shadow-[inset_0_1px_0_rgba(255,255,255,.88)] backdrop-blur-md [scrollbar-color:rgba(23,25,27,.18)_transparent] [scrollbar-width:thin]`}
        role="region"
        aria-label={positionLabel}
        tabIndex={0}
      >
        <ol className="flex min-w-[58rem] items-start xl:min-w-0">
          {steps.map((step, index) => {
            const state = index < activeIndex
              ? "done"
              : index === activeIndex
                ? "current"
                : index === activeIndex + 1
                  ? "next"
                  : "later";

            const leftLineClass = index === 0
              ? "bg-transparent"
              : index < activeIndex
                ? "bg-[var(--success)]/42"
                : index === activeIndex
                  ? "bg-[var(--brand)]"
                  : index === activeIndex + 1
                    ? "bg-[var(--accent)]/55"
                    : "bg-black/10";

            const rightLineClass = index === steps.length - 1
              ? "bg-transparent"
              : index < activeIndex - 1
                ? "bg-[var(--success)]/42"
                : index === activeIndex - 1
                  ? "bg-[var(--brand)]"
                  : index === activeIndex
                    ? "bg-[var(--accent)]/55"
                    : "bg-black/10";

            const nodeClass = state === "done"
              ? "bg-[var(--success)] text-white ring-4 ring-[var(--success-soft)]"
              : state === "current"
                ? "bg-[var(--brand)] text-white ring-4 ring-[var(--brand-soft)] shadow-[0_10px_24px_-12px_rgba(216,6,33,.8)]"
                : state === "next"
                  ? "bg-white text-[var(--foreground)] ring-2 ring-[var(--warning-border)]"
                  : "bg-white text-[var(--muted)] ring-1 ring-black/10";

            const labelClass = state === "current"
              ? "border border-[var(--brand-border)] bg-white text-[var(--brand-strong)] shadow-[0_10px_26px_-22px_rgba(216,6,33,.6)]"
              : state === "next"
                ? "border border-[var(--warning-border)] bg-[var(--warning-soft)] text-[var(--foreground)]"
                : state === "done"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--foreground-soft)]";

            return (
              <li key={step.key} className="min-w-0 flex-1">
                <Link
                  href={step.href}
                  aria-current={state === "current" ? "step" : undefined}
                  className="group flex min-w-[6.4rem] flex-col items-center text-center focus-visible:outline-none"
                >
                  <span className="flex w-full items-center" aria-hidden="true">
                    <span className={`h-px flex-1 transition-colors duration-200 ${leftLineClass}`} />
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-all duration-200 group-hover:-translate-y-0.5 ${nodeClass}`}
                    >
                      {state === "done" ? "✓" : index + 1}
                    </span>
                    <span className={`h-px flex-1 transition-colors duration-200 ${rightLineClass}`} />
                  </span>
                  <span
                    className={`mt-3 inline-flex min-h-9 max-w-[8.8rem] items-center justify-center rounded-full px-2.5 py-1.5 text-[12px] font-semibold leading-4 transition-all duration-200 group-hover:-translate-y-0.5 ${labelClass}`}
                  >
                    {step.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
