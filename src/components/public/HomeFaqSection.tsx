const faqs = [
  {
    question: "À quoi sert AlmaGo ?",
    answer:
      "AlmaGo structure votre projet d’études en Allemagne : projet académique, documents, orientation, candidatures, préparation linguistique, financement et prochaines démarches.",
  },
  {
    question: "Les informations affichées sont-elles officielles ?",
    answer:
      "AlmaGo distingue les informations internes du dossier et les données provenant de sources externes. Lorsqu’une fiche est vérifiée, sa source et sa date de contrôle sont conservées. La source officielle reste toujours la référence.",
  },
  {
    question: "AlmaGo décide-t-il de mon admission ou de mon visa ?",
    answer:
      "Non. AlmaGo organise, relie et explique les informations de votre dossier. Les décisions d’admission, de visa et de titre de séjour appartiennent aux universités et autorités compétentes.",
  },
  {
    question: "Comment AlmaGo gère-t-il les informations qui changent ?",
    answer:
      "Les catalogues vérifiés ont une durée de validité interne. Une fiche arrivée à échéance doit être revalidée avant de rester publiée comme information actuelle.",
  },
  {
    question: "Par où commencer ?",
    answer:
      "Créez votre dossier puis définissez votre projet. AlmaGo pourra ensuite vous montrer les éléments connus, ceux qui manquent et la prochaine action utile.",
  },
] as const;

export function HomeFaqSection() {
  return (
    <section id="faq" className="bg-white py-12 sm:py-14 lg:py-16" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[0.68fr_1.32fr] lg:px-8">
        <div className="rounded-[var(--radius-panel)] bg-[var(--brand-strong)] p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Questions fréquentes</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
            Comprendre AlmaGo avant de commencer.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/68">
            Les réponses essentielles sur le rôle de la plateforme, les sources et les décisions qui restent externes à AlmaGo.
          </p>
          <a
            href="/signup"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-white px-5 text-sm font-bold text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]"
          >
            Créer mon dossier
          </a>
        </div>

        <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 font-bold text-slate-950 outline-none transition-colors hover:bg-[var(--surface-subtle)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] sm:px-6">
                <span className="flex items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.14em] text-[var(--accent-strong)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm sm:text-base">{faq.question}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] text-lg font-medium text-[var(--brand)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 pl-[3.4rem] text-sm leading-6 text-slate-600 sm:px-6 sm:pb-5 sm:pl-[3.7rem]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
