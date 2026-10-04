import Link from "next/link";
import type { ProspectIntakeRecord, StarterDocumentSummary } from "@/lib/prospect/intake";

type JourneyStep = {
  key: string;
  label: string;
  href: string;
};

const steps: JourneyStep[] = [
  { key: "orientation", label: "Orientation", href: "/prospect/orientation" },
  { key: "documents", label: "Documents", href: "/prospect/documents" },
  { key: "review", label: "Analyse Campus", href: "/prospect/proposal" },
  { key: "proposal", label: "Proposition", href: "/prospect/proposal" },
  { key: "procedure", label: "Procédure", href: "/prospect/roadmap" },
  { key: "applications", label: "Candidatures", href: "/prospect/roadmap" },
  { key: "admission", label: "Admission", href: "/prospect/roadmap" },
  { key: "visa", label: "Visa & départ", href: "/prospect/roadmap" },
];

function currentIndex({
  hasOrientation,
  orientationConfirmed,
  intake,
  starterSummary,
}: {
  hasOrientation: boolean;
  orientationConfirmed: boolean;
  intake: ProspectIntakeRecord | null;
  starterSummary: StarterDocumentSummary;
}) {
  if (!hasOrientation || !orientationConfirmed) return 0;
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
  compact?: boolean;
}) {
  const activeIndex = currentIndex(props);
  const completed = Math.max(0, activeIndex);
  const percent = Math.round((completed / (steps.length - 1)) * 100);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-[var(--foreground)]">
          {activeIndex + 1}/{steps.length} étapes
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
