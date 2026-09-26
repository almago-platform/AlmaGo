const trustItems = [
  {
    title: "Source",
    description: "Une information vérifiée indique sa provenance et, lorsque nécessaire, sa date de contrôle.",
  },
  {
    title: "Statut",
    description: "Un élément est présenté comme fait confirmé, piste à examiner, action requise ou information en attente.",
  },
  {
    title: "Responsabilité",
    description: "La plateforme distingue ce qui dépend de l’étudiant, ce qui est suivi par AlmaGo et ce qui relève d’un organisme externe.",
  },
  {
    title: "Expiration",
    description: "Les catalogues vérifiés ne restent pas valides indéfiniment : les fiches doivent être revalidées.",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section id="confiance" className="border-y border-[var(--border)] bg-[var(--surface-subtle)] py-16 sm:py-20 lg:py-24" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
          <div>
            <p className="eyebrow">Confiance & provenance</p>
            <h2 id="trust-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
              La fiabilité doit être visible dans l’interface.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600">
              AlmaGo ne cherche pas à paraître officiel. La plateforme montre au contraire clairement son rôle, la provenance de ses informations et les limites de ce qu’elle peut conclure.
            </p>

            <div className="mt-7 border-l-2 border-[var(--accent)] pl-5">
              <p className="text-sm font-bold text-slate-950">La source officielle reste la référence.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Pour une admission, un délai, une règle consulaire ou une condition de financement, l’établissement ou l’autorité compétente garde la décision finale.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
            {trustItems.map((item, index) => (
              <article key={item.title} className="grid gap-3 border-b border-[var(--border)] p-5 last:border-b-0 sm:grid-cols-[3rem_10rem_1fr] sm:items-start sm:gap-5 sm:p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-bold text-slate-950">{item.title}</h3>
                <p className="text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
