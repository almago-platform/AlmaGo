import Image from "next/image";

const benefits = [
  {
    title: "Votre profil structuré",
    description:
      "Votre parcours académique et votre projet d’études restent regroupés dans un dossier clair.",
  },
  {
    title: "Vos documents suivis",
    description:
      "Les fichiers envoyés, leur statut et les demandes de correction restent visibles au même endroit.",
  },
  {
    title: "Votre orientation organisée",
    description:
      "Les programmes et recommandations sont présentés avec des critères lisibles et sans promesse artificielle.",
  },
  {
    title: "Vos candidatures lisibles",
    description:
      "Vous retrouvez le statut, l’échéance, la prochaine action et l’historique de chaque candidature.",
  },
];

export function HomeWhyAlmaGo() {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="why-almago-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:px-8">
        <div className="relative overflow-hidden rounded-[calc(var(--radius-panel)+0.35rem)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)]">
          <div className="relative min-h-[25rem] sm:min-h-[31rem]">
            <Image
              src="https://images.unsplash.com/photo-1781038507123-cbebc8ec508c?auto=format&fit=crop&q=86&w=1600"
              alt="Étudiants internationaux participant à une activité sur un campus universitaire"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />

            <div className="absolute inset-x-5 bottom-5 rounded-[var(--radius-panel)] border border-white/40 bg-white/92 p-5 text-slate-950 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.7)] backdrop-blur sm:inset-x-7 sm:bottom-7 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Pensé pour un vrai parcours étudiant</p>
              <p className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                Moins de dispersion, plus de clarté sur ce qui compte maintenant.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                AlmaGo organise les étapes du dossier sans transformer un suivi interne en garantie d’admission.
              </p>
            </div>

            <a
              href="https://unsplash.com/photos/people-signing-up-at-an-outdoor-event-desk-6JPMEebAP5A"
              target="_blank"
              rel="noreferrer"
              className="absolute right-3 top-3 rounded-full bg-slate-950/45 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur hover:bg-slate-950/60 hover:text-white"
            >
              Photo : Chidera F. Okeke / Unsplash
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Pourquoi AlmaGo</p>
          <h2 id="why-almago-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
            Un dossier plus clair, du premier document à la candidature.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            L’objectif n’est pas d’ajouter une plateforme de plus. AlmaGo rassemble les informations utiles pour que votre parcours vers l’Allemagne soit plus lisible et plus simple à suivre.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <article
                key={benefit.title}
                className="professional-hover rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden="true" className="h-1.5 w-8 rounded-full bg-[var(--accent)]/75" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-950">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{benefit.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
