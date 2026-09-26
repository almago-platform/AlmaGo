import Link from "next/link";

const steps = [
  ["01", "Projet", "Objectif académique"],
  ["02", "Orientation", "Programmes vérifiés"],
  ["03", "Documents", "Pièces et preuves"],
  ["04", "Candidatures", "Statuts et échéances"],
  ["05", "Préparation", "Langue et financement"],
  ["06", "Démarches", "Prochaine action"],
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-white">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] border-l border-[var(--border)] bg-[var(--surface-subtle)] lg:block" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(26rem,0.98fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 border-l-2 border-[var(--accent)] pl-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Parcours d’études en Allemagne
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
            Un dossier clair. Des étapes vérifiables. Une prochaine action visible.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            AlmaGo structure votre projet universitaire, vos preuves, vos candidatures, votre préparation linguistique et vos démarches dans un seul espace. Les informations importantes restent reliées à leur source et à leur statut de vérification.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 text-base font-bold text-white hover:bg-[var(--brand-strong)]"
            >
              Commencer mon dossier
            </Link>
            <a
              href="#parcours"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-6 text-base font-bold text-slate-800 hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Voir les 6 étapes
            </a>
          </div>

          <div className="mt-9 grid max-w-2xl gap-3 border-t border-[var(--border)] pt-5 text-sm text-slate-600 sm:grid-cols-3">
            <TrustFact title="Sources visibles" text="Les fiches vérifiées indiquent leur provenance." />
            <TrustFact title="Statuts explicites" text="À faire, en vérification ou terminé." />
            <TrustFact title="Rôle limité" text="AlmaGo n’accorde ni admission ni visa." />
          </div>
        </div>

        <div className="relative lg:pl-5">
          <div className="overflow-hidden rounded-[calc(var(--radius-panel)+0.2rem)] border border-[var(--brand-border)] bg-white shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">Votre parcours AlmaGo</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Une vue structurée du dossier</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800">
                Sources vérifiées
              </span>
            </div>

            <ol className="divide-y divide-[var(--border)]">
              {steps.map(([number, title, detail], index) => (
                <li key={number} className="grid grid-cols-[2.6rem_1fr_auto] items-center gap-3 px-5 py-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">
                    {number}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{detail}</p>
                  </div>
                  <span className={index === 0 ? "text-[11px] font-bold text-[var(--accent-strong)]" : "text-[11px] font-bold text-slate-400"}>
                    {index === 0 ? "Départ" : "→"}
                  </span>
                </li>
              ))}
            </ol>

            <div className="border-t border-[var(--border)] bg-[var(--brand)] px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">Principe AlmaGo</p>
              <p className="mt-1 text-sm font-semibold">
                Vous voyez ce qui est connu, ce qui manque et ce qui doit être vérifié.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustFact({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
