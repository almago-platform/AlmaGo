import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Définir votre projet",
    description: "Clarifiez le niveau d’études, le domaine visé et les grandes priorités de votre projet en Allemagne.",
  },
  {
    number: "02",
    title: "Vérifier les conditions",
    description: "Repérez les exigences visibles des programmes et identifiez ce qui doit encore être confirmé à la source officielle.",
  },
  {
    number: "03",
    title: "Préparer vos documents",
    description: "Regroupez les pièces utiles et suivez leur état dans votre dossier AlmaGo.",
  },
  {
    number: "04",
    title: "Comparer vos options",
    description: "Organisez les programmes et recommandations pour comprendre les différences importantes.",
  },
  {
    number: "05",
    title: "Suivre vos candidatures",
    description: "Gardez les statuts, échéances, prochaines actions et historiques au même endroit.",
  },
  {
    number: "06",
    title: "Préparer la suite",
    description: "Visualisez les démarches enregistrées après la candidature sans les confondre avec une décision officielle.",
  },
] as const;

export function HomeJourneySection() {
  return (
    <section id="parcours" className="overflow-hidden bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="journey-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Votre parcours Allemagne</p>
          <h2 id="journey-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Votre projet d’études en 6 étapes claires.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Une vue simple du parcours pour comprendre où vous en êtes, ce qui reste à préparer et quelle action vient ensuite.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[calc(var(--radius-panel)+0.35rem)] border border-[var(--brand-border)] bg-[var(--brand)] shadow-[0_30px_80px_-48px_rgba(15,23,42,0.5)] lg:grid-cols-[minmax(20rem,0.82fr)_minmax(0,1.18fr)]">
          <div className="relative min-h-[25rem] overflow-hidden lg:min-h-[44rem]">
            <Image
              src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&q=86&w=1500"
              alt="Étudiants dans un environnement d’apprentissage universitaire"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-[rgba(32,38,111,0.12)] to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
              <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-bold shadow-lg">
                6 étapes
              </div>
              <h3 className="mt-4 max-w-md text-2xl font-bold tracking-tight sm:text-3xl">
                Un parcours complexe devient plus simple quand chaque étape est visible.
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-200">
                AlmaGo organise votre suivi. Les décisions d’admission et démarches officielles restent celles des établissements et autorités concernés.
              </p>
              <a
                href="https://unsplash.com/photos/iQPr1XkF5F0"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-[11px] font-medium text-white/80 underline decoration-white/30 underline-offset-2 hover:text-white"
              >
                Photo : Javier Trueba / Unsplash
              </a>
            </div>
          </div>

          <div className="bg-[#f7f8fd] p-5 sm:p-7 lg:p-9">
            <ol className="relative grid gap-0">
              {steps.map((step, index) => (
                <li key={step.number} className="group relative grid grid-cols-[3rem_minmax(0,1fr)] gap-4 pb-6 last:pb-0 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-5">
                  {index < steps.length - 1 && (
                    <span aria-hidden="true" className="absolute bottom-0 left-[1.45rem] top-12 w-px bg-[var(--brand-border)] sm:left-[1.7rem]" />
                  )}

                  <span className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-[var(--brand-border)] bg-white text-sm font-bold text-[var(--brand)] shadow-sm sm:h-14 sm:w-14">
                    {step.number}
                  </span>

                  <div className="rounded-[var(--radius-panel)] border border-transparent px-1 py-1 transition-colors duration-150 group-hover:border-[var(--border)] group-hover:bg-white group-hover:px-4 group-hover:py-3">
                    <h3 className="text-lg font-bold tracking-tight text-slate-950">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Le rôle d’AlmaGo</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                Vous donner une lecture structurée de votre dossier et de vos prochaines actions — sans transformer un suivi interne en promesse d’admission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
