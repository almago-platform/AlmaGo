const steps = [
  {
    number: "01",
    title: "Définir votre projet",
    description: "Clarifiez le niveau d’études, le domaine, la langue et vos priorités pour l’Allemagne.",
  },
  {
    number: "02",
    title: "Vérifier les conditions",
    description: "Repérez les critères à contrôler pour chaque programme et gardez les sources officielles à portée de main.",
  },
  {
    number: "03",
    title: "Préparer vos documents",
    description: "Centralisez les pièces utiles et suivez ce qui est reçu, vérifié ou à corriger dans AlmaGo.",
  },
  {
    number: "04",
    title: "Comparer vos options",
    description: "Organisez les programmes qui vous intéressent et comparez les critères enregistrés de façon lisible.",
  },
  {
    number: "05",
    title: "Suivre vos candidatures",
    description: "Gardez l’échéance, le statut, la prochaine action et l’historique de chaque candidature au même endroit.",
  },
  {
    number: "06",
    title: "Préparer les démarches suivantes",
    description: "Une fois la candidature avancée, rassemblez les prochaines étapes à préparer sans confondre suivi et décision officielle.",
  },
] as const;

export function HomeJourneySection() {
  return (
    <section id="parcours" className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="journey-title">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[var(--border)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="eyebrow">Votre parcours Allemagne</p>
            <h2 id="journey-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
              Votre projet d’études en 6 étapes claires.
            </h2>
          </div>

          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-base leading-7 text-slate-600 sm:text-lg">
              Une vue simple du parcours pour comprendre où vous en êtes et ce qui vient ensuite. AlmaGo organise et suit les informations ; les décisions d’admission et de visa appartiennent toujours aux organismes compétents.
            </p>
          </div>
        </div>

        <ol className="relative mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Parcours d’études en Allemagne en six étapes">
          {steps.map((step, index) => (
            <li key={step.number} className="relative">
              <article className="professional-hover group h-full rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-bold text-white shadow-[0_10px_24px_-16px_rgba(41,48,139,0.95)]">
                    {step.number}
                  </span>
                  <div aria-hidden="true" className="h-px flex-1 bg-[var(--border)] group-hover:bg-[var(--brand-border)]" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Étape {index + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>

                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[var(--brand)]">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  <span>Suivi structuré dans AlmaGo</span>
                </div>
              </article>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6">
          <div>
            <p className="text-sm font-bold text-[var(--brand)]">Une progression lisible, pas une promesse artificielle.</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              Les étapes montrent ce qui est préparé dans votre dossier. Elles ne représentent ni une probabilité d’admission ni une décision officielle.
            </p>
          </div>
          <a
            href="#espace"
            className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-4 text-sm font-bold text-[var(--brand)] transition-colors hover:border-[var(--brand)] hover:bg-white sm:mt-0"
          >
            Voir l’espace AlmaGo
          </a>
        </div>
      </div>
    </section>
  );
}
