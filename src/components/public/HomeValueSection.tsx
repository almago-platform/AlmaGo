const valueItems = [
  {
    number: "01",
    title: "Un dossier unique",
    description: "Profil, documents, preuves académiques, candidatures et démarches restent reliés dans le même espace.",
  },
  {
    number: "02",
    title: "Des critères sourcés",
    description: "Les programmes, cours et informations réglementaires sont présentés avec une source officielle quand elle est disponible.",
  },
  {
    number: "03",
    title: "Une prochaine action",
    description: "Le dossier distingue ce qui est à faire par vous, ce qui est en vérification et ce qui est déjà terminé.",
  },
  {
    number: "04",
    title: "Des limites explicites",
    description: "AlmaGo organise et explique. Les décisions d’admission, de visa et de titre de séjour restent externes à la plateforme.",
  },
] as const;

export function HomeValueSection() {
  return (
    <section className="bg-[var(--surface-subtle)] py-14 sm:py-20" aria-labelledby="why-almago-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-b border-[var(--border)] pb-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="eyebrow">Pourquoi AlmaGo</p>
            <h2 id="why-almago-title" className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              Un accompagnement structuré, sans transformer l’incertitude en promesse.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Le produit est conçu comme un dossier de travail : chaque information importante doit avoir un statut, une provenance ou une prochaine action. Cette structure réduit la dispersion et rend le parcours plus lisible.
          </p>
        </div>

        <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-2 xl:grid-cols-4">
          {valueItems.map((item) => (
            <article key={item.number} className="bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold tracking-[0.16em] text-[var(--accent-strong)]">{item.number}</span>
                <span aria-hidden="true" className="h-px w-10 bg-[var(--brand-border)]" />
              </div>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em] text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
