const trustItems = [
  {
    title: "Une recommandation",
    description:
      "C’est une piste de travail publiée dans votre dossier. Elle ne signifie pas que l’université vous acceptera.",
  },
  {
    title: "La progression du dossier",
    description:
      "Elle suit les éléments préparés dans AlmaGo. Elle n’est ni une probabilité d’admission ni une décision d’une autorité.",
  },
  {
    title: "Le statut d’un document",
    description:
      "Il décrit l’état de suivi dans AlmaGo, par exemple reçu, vérifié ou à remplacer. Il ne remplace pas la validation d’un organisme externe.",
  },
  {
    title: "Le suivi d’une candidature",
    description:
      "Il reprend le statut, l’échéance et la prochaine action enregistrés. La décision finale appartient à l’établissement concerné.",
  },
] as const;

export function HomeTrustSection() {
  return (
    <section id="confiance" className="bg-white py-16 sm:py-20 lg:py-24" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[calc(var(--radius-panel)+0.35rem)] bg-[var(--brand)] text-white shadow-[0_28px_70px_-42px_rgba(41,48,139,0.8)]">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
              <div aria-hidden="true" className="absolute -left-20 -top-20 h-56 w-56 rounded-full border-[42px] border-white/[0.04]" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">Transparence</p>
                <h2 id="trust-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                  Une plateforme claire sur son rôle.
                </h2>
                <p className="mt-5 text-base leading-7 text-indigo-100">
                  AlmaGo organise et rend visibles les informations de votre dossier. La plateforme ne transforme pas une progression, une recommandation ou un statut interne en garantie d’admission.
                </p>

                <div className="mt-7 rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5">
                  <p className="text-sm font-bold text-white">La source officielle reste la référence.</p>
                  <p className="mt-2 text-sm leading-6 text-indigo-100">
                    Pour les conditions d’un programme, les délais ou une décision externe, vérifiez toujours les informations auprès de l’université ou de l’organisme compétent.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {trustItems.map((item, index) => (
                <article key={item.title} className="bg-[var(--brand)] p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span aria-hidden="true" className="h-1.5 w-8 rounded-full bg-[var(--accent)]" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
