const faqs = [
  {
    question: "À quoi sert AlmaGo ?",
    answer:
      "AlmaGo vous aide à structurer votre projet d’études en Allemagne en regroupant votre profil, vos documents, votre orientation, vos démarches et le suivi de vos candidatures.",
  },
  {
    question: "À qui s’adresse AlmaGo ?",
    answer:
      "AlmaGo s’adresse aux étudiants qui préparent un projet d’études en Allemagne et souhaitent garder leurs documents, leurs démarches et leurs candidatures plus faciles à suivre.",
  },
  {
    question: "Puis-je suivre mes documents et mes candidatures ?",
    answer:
      "Oui. L’espace étudiant permet de retrouver les documents envoyés et leur statut dans AlmaGo, ainsi que les candidatures enregistrées, leurs échéances et les prochaines actions connues.",
  },
  {
    question: "AlmaGo décide-t-il de mon admission ?",
    answer:
      "Non. AlmaGo organise votre dossier et peut présenter des pistes d’orientation. Les décisions d’admission, de visa ou de validation appartiennent toujours aux universités et organismes compétents.",
  },
  {
    question: "Par où commencer ?",
    answer:
      "Créez votre espace puis commencez par compléter votre profil. Le dossier pourra ensuite regrouper vos documents, votre orientation et les prochaines étapes enregistrées.",
  },
] as const;

export function HomeFaqSection() {
  return (
    <section id="faq" className="bg-[#fbfaf8] py-16 sm:py-20 lg:py-24" aria-labelledby="faq-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.68fr_1.32fr] lg:gap-14 lg:px-8">
        <div>
          <p className="eyebrow">Questions fréquentes</p>
          <h2 id="faq-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Les réponses essentielles avant de commencer.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Nous gardons ici les points les plus importants : le rôle d’AlmaGo, ce que vous pouvez suivre et ce qui reste toujours du ressort des organismes officiels.
          </p>
        </div>

        <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 px-5 py-4 font-bold text-slate-950 outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--brand)] sm:px-6">
                <span className="flex items-center gap-4">
                  <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{faq.question}</span>
                </span>
                <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-lg font-medium text-[var(--brand)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-5 pb-5 pl-[4.3rem] text-sm leading-7 text-slate-600 sm:px-6 sm:pb-6 sm:pl-[4.55rem]">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
