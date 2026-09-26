const steps = [
  {
    number: "01",
    title: "Définir votre projet",
    description: "Diplôme, domaine, langue et rentrée visée : le dossier commence par une direction claire.",
  },
  {
    number: "02",
    title: "Vérifier votre base académique",
    description: "Ajoutez les preuves utiles et distinguez ce qui est acquis de ce qui doit encore être vérifié.",
  },
  {
    number: "03",
    title: "Explorer les programmes",
    description: "Comparez les pistes enregistrées avec leurs critères, échéances et sources disponibles.",
  },
  {
    number: "04",
    title: "Préparer vos candidatures",
    description: "Suivez chaque dossier avec son statut, sa prochaine action et ses échéances.",
  },
  {
    number: "05",
    title: "Organiser votre préparation",
    description: "Langue, financement et assurance restent reliés à votre parcours réel.",
  },
  {
    number: "06",
    title: "Suivre les démarches suivantes",
    description: "Votre checklist rassemble ce qui reste à faire et ce qui dépend d’un organisme externe.",
  },
] as const;

export function HomeJourneySection() {
  return (
    <section id="parcours" className="border-y border-[var(--border)] bg-[#f4f6f8] py-12 sm:py-14 lg:py-16" aria-labelledby="journey-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">Le parcours AlmaGo</p>
            <h2 id="journey-title" className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Six étapes. Une logique visible du début à la suite.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Chaque étape prépare la suivante. Le but n’est pas de vous donner un score, mais de rendre le dossier lisible et de montrer où votre attention est utile.
          </p>
        </div>

        <ol className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3" aria-label="Parcours d’études en Allemagne en six étapes">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="group relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full text-xs font-bold ${
                    index === 0
                      ? "bg-[var(--brand)] text-white"
                      : "border border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand)]"
                  }`}
                >
                  {step.number}
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Étape {index + 1}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-bold tracking-[-0.02em] text-slate-950">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>

              <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[var(--brand)]">
                <span className="h-px flex-1 bg-[var(--brand-border)]" />
                <span aria-hidden="true">{index < steps.length - 1 ? "→" : "✓"}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-5 grid gap-3 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand)] p-5 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-bold">La progression décrit votre préparation, pas vos chances d’admission.</p>
            <p className="mt-1 text-sm leading-6 text-white/68">
              Les universités et autorités compétentes conservent les décisions officielles.
            </p>
          </div>
          <a href="#espace" className="text-sm font-bold text-white hover:underline hover:underline-offset-4">
            Voir l’espace étudiant →
          </a>
        </div>
      </div>
    </section>
  );
}
