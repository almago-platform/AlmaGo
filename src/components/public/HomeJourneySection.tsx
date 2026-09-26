const steps = [
  {
    number: "01",
    title: "Définir votre projet",
    description: "Précisez le diplôme visé, le domaine, la langue et le pays depuis lequel vous préparez vos démarches.",
  },
  {
    number: "02",
    title: "Vérifier votre base académique",
    description: "Ajoutez les preuves utiles et distinguez admission définitive, base préparatoire ou recherche de place.",
  },
  {
    number: "03",
    title: "Explorer les programmes",
    description: "Consultez des programmes enregistrés avec leurs critères, échéances et sources officielles disponibles.",
  },
  {
    number: "04",
    title: "Préparer vos candidatures",
    description: "Suivez les dossiers, les échéances et les prochaines actions sans confondre suivi interne et décision universitaire.",
  },
  {
    number: "05",
    title: "Organiser la préparation",
    description: "Choisissez explicitement un cours vérifié si votre parcours l’exige et consultez les options de financement ou d’assurance.",
  },
  {
    number: "06",
    title: "Suivre les démarches suivantes",
    description: "Votre checklist rassemble les étapes calculées à partir des faits actuellement enregistrés dans votre dossier.",
  },
] as const;

export function HomeJourneySection() {
  return (
    <section id="parcours" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="journey-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">Le parcours</p>
            <h2 id="journey-title" className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Six étapes, dans un ordre compréhensible.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Comme dans une procédure administrative bien conçue, chaque étape explique son objectif et prépare la suivante. AlmaGo évite les scores opaques et affiche les faits connus du dossier.
          </p>
        </div>

        <ol className="mt-10 border-y border-[var(--border)]" aria-label="Parcours d’études en Allemagne en six étapes">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="grid gap-3 border-b border-[var(--border)] py-5 last:border-b-0 sm:grid-cols-[4.5rem_minmax(12rem,0.72fr)_minmax(0,1.28fr)_2rem] sm:items-center sm:gap-5"
            >
              <span className="text-sm font-bold tracking-[0.14em] text-[var(--accent-strong)]">{step.number}</span>
              <h3 className="text-base font-bold text-slate-950">{step.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{step.description}</p>
              <span aria-hidden="true" className="hidden text-right text-slate-300 sm:block">{index < steps.length - 1 ? "↓" : "✓"}</span>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <p className="text-sm font-bold text-[var(--brand)]">La progression décrit le dossier, pas vos chances d’admission.</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">Les décisions finales appartiennent aux universités et aux autorités compétentes.</p>
          </div>
          <a href="#espace" className="text-sm font-bold text-[var(--brand)] hover:underline hover:underline-offset-4">
            Voir l’espace étudiant →
          </a>
        </div>
      </div>
    </section>
  );
}
