import Link from "next/link";

export type StudentJourneyStage = {
  label: string;
  detail: string;
  href?: string;
  tone?: "done" | "active" | "neutral";
};

export function StudentJourneyOverview({ stages }: { stages: StudentJourneyStage[] }) {
  return (
    <section aria-labelledby="student-journey-title" className="mt-8">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre parcours</p>
          <h2 id="student-journey-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Votre projet Allemagne, étape par étape
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          Ces repères décrivent uniquement les éléments enregistrés dans AlmaGo. Ils ne représentent pas une probabilité d’admission.
        </p>
      </div>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stages.map((stage, index) => {
          const card = (
            <div
              className={`group h-full rounded-[var(--radius-panel)] border p-4 transition-all duration-150 ${
                stage.tone === "done"
                  ? "border-emerald-200 bg-emerald-50/55"
                  : stage.tone === "active"
                    ? "border-[var(--brand-border)] bg-white shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] bg-white/70"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold ${
                    stage.tone === "done"
                      ? "bg-emerald-600 text-white"
                      : stage.tone === "active"
                        ? "bg-[var(--brand)] text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {stage.tone === "done" ? "✓" : index + 1}
                </span>
                {stage.href && <span aria-hidden="true" className="text-sm text-slate-400 transition-transform group-hover:translate-x-0.5">→</span>}
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-950">{stage.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">{stage.detail}</p>
            </div>
          );

          return (
            <li key={stage.label}>
              {stage.href ? (
                <Link href={stage.href} className="block h-full rounded-[var(--radius-panel)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2">
                  {card}
                </Link>
              ) : (
                card
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
