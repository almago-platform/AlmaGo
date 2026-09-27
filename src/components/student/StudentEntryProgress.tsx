type EntryStage = 1 | 2 | 3;

const stages = [
  { id: 1 as const, label: "Compte", detail: "Créer votre accès" },
  { id: 2 as const, label: "Dossier initial", detail: "Renseigner votre profil" },
  { id: 3 as const, label: "Espace étudiant", detail: "Suivre votre parcours" },
];

export function StudentEntryProgress({
  current,
  compact = false,
}: {
  current: EntryStage;
  compact?: boolean;
}) {
  return (
    <div aria-label="Progression de création du dossier">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
          Parcours de démarrage
        </p>
        <span className="text-xs font-semibold text-[var(--muted)]">Étape {current} sur 3</span>
      </div>

      <ol className={compact ? "mt-2 grid grid-cols-3 gap-1.5" : "mt-3 grid gap-2 sm:grid-cols-3"}>
        {stages.map((stage) => {
          const active = stage.id === current;
          const done = stage.id < current;
          return (
            <li
              key={stage.id}
              aria-current={active ? "step" : undefined}
              className={
                compact
                  ? "min-w-0"
                  : `rounded-[var(--radius-control)] border px-3 py-3 ${
                      active
                        ? "border-[var(--brand-border)] bg-[var(--brand-soft)]"
                        : done
                          ? "border-[var(--border)] bg-[var(--surface-subtle)]"
                          : "border-[var(--border)] bg-[var(--surface)]"
                    }`
              }
            >
              {compact ? (
                <div
                  className={
                    "h-1.5 rounded-full " +
                    (active || done ? "bg-[var(--brand)]" : "bg-[var(--border)]")
                  }
                />
              ) : (
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={
                      "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold " +
                      (active || done
                        ? "bg-[var(--brand)] text-white"
                        : "bg-[var(--surface-muted)] text-[var(--muted)]")
                    }
                  >
                    {done ? "✓" : stage.id}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)]">{stage.label}</p>
                    <p className="mt-0.5 text-[0.68rem] leading-4 text-[var(--muted)]">{stage.detail}</p>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
