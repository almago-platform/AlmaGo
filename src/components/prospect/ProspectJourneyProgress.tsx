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
  if (preBac) return 1;
  if (!intake || intake.status === "starter_documents") return 1;
  if (intake.status === "campus_review") return 2;
  if (intake.status === "route_proposed" || intake.status === "student_question") return 3;
  if (intake.status === "procedure_created") return 4;

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
        <span className="font-semibold text-[var(--foreground)]">
          {currentStepNumber}/{steps.length} {copy.count}
        </span>
        <span className="text-[var(--muted)]">{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className="h-full rounded-full bg-[var(--brand)] transition-[width]"
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>

      <ol
        className={
          props.compact
            ? "mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
            : "mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        }
      >
        {steps.map((step, index) => {
          const state = index < activeIndex
            ? "done"
            : index === activeIndex
              ? "current"
              : index === activeIndex + 1
                ? "next"
                : "later";

          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={`block rounded-[var(--radius-control)] border p-3 transition-colors ${
                  state === "current"
                    ? "border-[var(--brand-border)] bg-[var(--brand-soft)]"
                    : state === "done"
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand-border)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      state === "done"
                        ? "bg-emerald-600 text-white"
                        : state === "current"
                          ? "bg-[var(--brand)] text-white"
                          : "bg-[var(--surface-muted)] text-[var(--muted)]"
                    }`}
                  >
                    {state === "done" ? "✓" : index + 1}
                  </span>
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {step.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
