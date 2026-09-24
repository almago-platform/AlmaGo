import Image from "next/image";

const valueItems = [
  {
    number: "01",
    title: "Votre profil structuré",
    description: "Votre parcours académique et votre projet d’études restent regroupés dans un dossier lisible.",
    icon: "profile",
  },
  {
    number: "02",
    title: "Vos documents suivis",
    description: "Les fichiers envoyés, leur statut et les éventuelles demandes de correction restent visibles.",
    icon: "documents",
  },
  {
    number: "03",
    title: "Votre orientation organisée",
    description: "Les programmes et pistes d’orientation sont présentés avec des critères compréhensibles et vérifiables.",
    icon: "orientation",
  },
  {
    number: "04",
    title: "Vos candidatures lisibles",
    description: "Statut, échéance, prochaine action et historique sont regroupés au même endroit.",
    icon: "applications",
  },
] as const;

export function HomeValueSection() {
  return (
    <section className="bg-[#fbfaf8] py-16 sm:py-20 lg:py-24" aria-labelledby="why-almago-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:gap-14 lg:px-8">
        <div>
          <div className="relative overflow-hidden rounded-[calc(var(--radius-panel)+0.35rem)] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[var(--shadow-card)]">
            <div className="relative min-h-[24rem] sm:min-h-[30rem]">
              <Image
                src="https://images.unsplash.com/photo-1781038507123-cbebc8ec508c?auto=format&fit=crop&q=86&w=1600"
                alt="Étudiants internationaux participant à une activité sur un campus universitaire"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/5 to-transparent" />

              <div className="absolute inset-x-5 bottom-5 rounded-[var(--radius-panel)] border border-white/40 bg-white/92 p-5 text-slate-950 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.72)] backdrop-blur sm:inset-x-7 sm:bottom-7 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Pensé pour le parcours étudiant</p>
                <p className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  Moins de dispersion, plus de visibilité sur ce qui compte maintenant.
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Profil, documents, orientation et candidatures restent reliés dans un même parcours.
                </p>
              </div>

              <a
                href="https://unsplash.com/photos/people-signing-up-at-an-outdoor-event-desk-6JPMEebAP5A"
                target="_blank"
                rel="noreferrer"
                className="absolute right-3 top-3 rounded-full bg-slate-950/45 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur transition-colors hover:bg-slate-950/65 hover:text-white"
              >
                Photo : Chidera F. Okeke / Unsplash
              </a>
            </div>
          </div>
        </div>

        <div>
          <p className="eyebrow">Pourquoi AlmaGo</p>
          <h2 id="why-almago-title" className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
            Un dossier plus clair, du premier document à la candidature.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            AlmaGo ne remplace pas les organismes officiels. Le service vous aide à organiser ce que vous préparez, ce qui reste à vérifier et les prochaines étapes de votre parcours.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {valueItems.map((item) => (
              <article
                key={item.title}
                className="professional-hover group relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6"
              >
                <div aria-hidden="true" className="absolute right-0 top-0 h-20 w-20 rounded-bl-[3.5rem] bg-[var(--brand-soft)]/70 transition-transform duration-200 group-hover:scale-110" />
                <div className="relative">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-control)] bg-[var(--brand-soft)] text-[var(--brand)]">
                      <ValueIcon type={item.icon} />
                    </span>
                    <span className="text-xs font-bold tracking-[0.16em] text-slate-600">{item.number}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueIcon({ type }: { type: (typeof valueItems)[number]["icon"] }) {
  const common = "h-6 w-6";

  if (type === "profile") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6" /></svg>;
  }
  if (type === "documents") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
  }
  if (type === "orientation") {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}><path d="M5 5h14v16H5z" /><path d="M9 3h6v4H9zM8 11h8M8 15h8" /></svg>;
}
