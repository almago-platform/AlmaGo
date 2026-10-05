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

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-bold text-[#202326]">
          {currentStepNumber}/{steps.length} {copy.count}
        </span>
        <span className="rounded-full bg-[#f1eee8] px-2.5 py-1 text-xs font-bold tabular-nums text-[#5f6468]">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/[.08]">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand),#ef334d)] transition-[width]"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>

      <ol
        className={`mt-5 grid overflow-hidden rounded-[1.2rem] border border-black/[.07] bg-black/[.06] gap-px sm:grid-cols-2 xl:grid-cols-5 ${props.compact ? "" : "shadow-[0_22px_58px_-42px_rgba(0,0,0,.32)]"}`}
      >
        {steps.map((step, index) => {
          const state = index < activeIndex
            ? "done"
            : index === activeIndex
              ? "current"
              : index === activeIndex + 1
                ? "next"
                : "later";

          const surfaceClass = state === "current"
            ? "bg-[var(--brand-soft)]"
            : state === "done"
              ? "bg-emerald-50/70"
              : state === "next"
                ? "bg-[var(--accent-light)]/45"
                : "bg-white";

          return (
            <li key={step.key} className="min-w-0">
              <Link
                href={step.href}
                aria-current={state === "current" ? "step" : undefined}
                className={`flex min-h-full items-center gap-2.5 px-3 ${props.compact ? "py-2.5" : "py-3.5"} text-sm transition-all duration-200 hover:brightness-[.985] ${surfaceClass}`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${state === "done"
                    ? "bg-[#17191b] text-white"
                    : state === "current"
                      ? "bg-[var(--brand)] text-white"
                      : "bg-white text-[#73787c] ring-1 ring-inset ring-black/10"}`}
                >
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="min-w-0 font-semibold leading-5 text-[#25292c]">
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
