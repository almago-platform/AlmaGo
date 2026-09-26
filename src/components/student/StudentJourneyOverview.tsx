import Link from "next/link";

export type StudentJourneyStage = {
  label: string;
  detail: string;
  href?: string;
  tone?: "done" | "active" | "neutral";
};

export function StudentJourneyOverview({ stages }: { stages: StudentJourneyStage[] }) {
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.tone === "done");
  const activeStage = stages.find((stage) => stage.tone === "active");
  const progressPercent = totalStages > 0 ? Math.round((completedStages.length / totalStages) * 100) : 0;

  return (
    <section aria-labelledby="student-journey-title" className="mt-9">
      <div className="grid gap-4 border-b border-[var(--border)] pb-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Parcours du dossier</p>
          <h2 id="student-journey-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">
            Votre projet Allemagne, étape par étape
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Ces repères décrivent les éléments enregistrés dans AlmaGo. Ils ne représentent pas une probabilité d’admission.
          </p>
        </div>

        <div className="min-w-[15rem]">
          <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-600">
            <span>{completedStages.length} / {totalStages} repères terminés</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200" aria-hidden="true">
            <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${progressPercent}%` }} />
          </div>
          {activeStage && <p className="mt-2 text-xs text-slate-500">Étape active : <span className="font-semibold text-slate-700">{activeStage.label}</span></p>}
        </div>
      </div>

      <ol className="divide-y divide-[var(--border)] border-b border-[var(--border)]">
        {stages.map((stage, index) => {
          const status =
            stage.tone === "done"
              ? { label: "Terminé", className: "text-emerald-800 bg-emerald-50 border-emerald-200", marker: "✓" }
              : stage.tone === "active"
                ? { label: "En cours", className: "text-[var(--brand)] bg-[var(--brand-soft)] border-[var(--brand-border)]", marker: String(index + 1) }
                : { label: "À venir", className: "text-slate-600 bg-[var(--surface-subtle)] border-[var(--border)]", marker: String(index + 1) };

          const content = (
            <div className="grid gap-3 py-4 sm:grid-cols-[2.5rem_minmax(8rem,0.7fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-4">
              <span className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${status.className}`}>
                {status.marker}
              </span>
              <p className="text-sm font-bold text-slate-950">{stage.label}</p>
              <p className="text-sm leading-6 text-slate-600">{stage.detail}</p>
              <span className="justify-self-start text-xs font-bold text-slate-500 sm:justify-self-end">
                {stage.href ? "Ouvrir →" : status.label}
              </span>
            </div>
          );

          return (
            <li key={stage.label}>
              {stage.href ? (
                <Link
                  href={stage.href}
                  className="block rounded-[var(--radius-control)] px-1 hover:bg-[var(--surface-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
                >
                  {content}
                </Link>
              ) : content}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
