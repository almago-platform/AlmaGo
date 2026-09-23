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
    description: "Les programmes et recommandations sont présentés avec des critères compréhensibles et vérifiables.",
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
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(17rem,0.72fr)_minmax(0,1.28fr)] lg:gap-14 lg:px-8">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Pourquoi AlmaGo</p>
          <h2 id="why-almago-title" className="mt-3 max-w-xl text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Un dossier plus clair, du premier document à la candidature.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            AlmaGo ne remplace pas les organismes officiels. La plateforme vous aide à organiser ce que vous préparez, ce qui reste à vérifier et les prochaines actions de votre parcours.
          </p>

          <div className="mt-7 border-l-4 border-[var(--accent)] pl-5">
            <p className="text-sm font-bold text-slate-950">Pensé pour le parcours étudiant</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Moins de dispersion entre fichiers, notes et échéances ; plus de visibilité sur votre dossier.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {valueItems.map((item) => (
            <article
              key={item.title}
              className="professional-hover group relative overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7"
            >
              <div aria-hidden="true" className="absolute right-0 top-0 h-24 w-24 rounded-bl-[4rem] bg-[var(--brand-soft)]/70 transition-transform duration-200 group-hover:scale-110" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-control)] bg-[var(--brand-soft)] text-[var(--brand)]">
                    <ValueIcon type={item.icon} />
                  </span>
                  <span className="text-xs font-bold tracking-[0.16em] text-slate-600">{item.number}</span>
                </div>
                <h3 className="mt-7 text-xl font-bold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </article>
          ))}
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
