const trustItems = [
  {
    title: "Source visible",
    description: "Une information vérifiée indique sa provenance et, lorsque nécessaire, sa date de contrôle.",
    mark: "S",
  },
  {
    title: "Statut compréhensible",
    description: "Fait confirmé, piste à examiner, action requise ou information en attente : le statut reste explicite.",
    mark: "✓",
  },
  {
    title: "Responsabilité claire",
    description: "Le produit distingue votre action, le suivi AlmaGo et ce qui relève d’un organisme externe.",
    mark: "R",
  },
  {
    title: "Information revalidée",
    description: "Les catalogues vérifiés ne restent pas valides indéfiniment : une information ancienne doit être recontrôlée.",
    mark: "↻",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section id="confiance" className="border-y border-[var(--border)] bg-[#f4f6f8] py-12 sm:py-14 lg:py-16" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="eyebrow">Confiance & provenance</p>
            <h2 id="trust-title" className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Le sérieux doit se voir, pas seulement se déclarer.
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              AlmaGo montre son rôle, ses sources et ses limites directement dans l’interface. La source officielle reste toujours la référence.
            </p>
            <p className="mt-3 border-l-2 border-[var(--accent)] pl-4 text-sm font-bold text-slate-800">
              Admission, visa et titre de séjour : décisions des organismes compétents.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {trustItems.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-4 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:grid-cols-[3rem_1fr] sm:p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                {item.mark}
              </span>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-950">{item.title}</h3>
                  <span className="text-[10px] font-bold tracking-[0.14em] text-slate-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
