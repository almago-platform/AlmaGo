import Link from "next/link";

export type StudentJourneyStage = {
  label: string;
  detail: string;
  href?: string;
  tone?: "done" | "active" | "neutral";
};

export function StudentJourneyOverview({ stages }: { stages: StudentJourneyStage[] }) {
  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.tone === "done");
  const activeStage = stages.find((s) => s.tone === "active");
  const progressPercent = totalStages > 0 ? Math.round((completedStages.length / totalStages) * 100) : 0;

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

      {totalStages > 0 && (
        <div className="mt-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)]/45 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              <span className="font-bold text-slate-950">{completedStages.length} sur {totalStages} étapes validées</span>
              {activeStage ? ` · Étape actuelle : ${activeStage.label}` : ""}
            </p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-2 w-full sm:w-48 rounded-full bg-slate-200 overflow-hidden" aria-hidden="true">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="sr-only">Progression du parcours</span>
            </div>
          </div>
        </div>
      )}

      <ol className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stages.map((stage, index) => {
          const card = (
            <div
              className={`group flex flex-col justify-between h-full rounded-[var(--radius-panel)] border p-4 transition-all duration-150 ${
                stage.tone === "done"
                  ? "border-emerald-200 bg-emerald-50/55"
                  : stage.tone === "active"
                    ? "border-[var(--brand-border)] bg-white shadow-[var(--shadow-card)]"
                    : "border-[var(--border)] bg-white/70"
              }`}
            >
              <div>
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
                  {stage.tone === "done" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Terminé</span>
                  )}
                  {stage.tone === "active" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand)] bg-[var(--brand-soft)] px-2 py-0.5 rounded ring-1 ring-[var(--brand-border)]">En cours</span>
                  )}
                  {stage.tone !== "done" && stage.tone !== "active" && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">À venir</span>
                  )}
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-950">{stage.label}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-600">{stage.detail}</p>
              </div>
              {stage.href && (
                <div className="mt-4 flex items-center justify-end text-xs font-semibold text-[var(--brand)] gap-1">
                  <span>Accéder</span>
                  <span aria-hidden="true" className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              )}
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
