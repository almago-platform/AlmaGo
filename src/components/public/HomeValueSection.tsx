const valueItems = [
  {
    number: "01",
    title: "Un dossier unique",
    description: "Profil, documents, preuves académiques, candidatures et démarches restent reliés dans le même espace.",
    icon: "folder",
  },
  {
    number: "02",
    title: "Des critères sourcés",
    description: "Les informations importantes conservent une provenance claire et, lorsque nécessaire, une date de vérification.",
    icon: "source",
  },
  {
    number: "03",
    title: "Une prochaine action",
    description: "Vous voyez ce qui dépend de vous, ce qui est en vérification et ce qui peut attendre.",
    icon: "next",
  },
  {
    number: "04",
    title: "Des limites explicites",
    description: "AlmaGo organise et explique. Les universités et autorités compétentes gardent la décision finale.",
    icon: "shield",
  },
] as const;

export function HomeValueSection() {
  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16" aria-labelledby="why-almago-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="eyebrow">Pourquoi AlmaGo</p>
            <h2 id="why-almago-title" className="mt-2 max-w-xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Plus qu’une liste de démarches : un dossier qui reste lisible.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600 lg:justify-self-end">
            Chaque partie du produit répond à une question simple : qu’est-ce qui est connu, qu’est-ce qui manque, quelle est la source et quelle action est utile maintenant ?
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {valueItems.map((item, index) => {
            const featured = index === 0;
            return (
              <article
                key={item.number}
                className={`relative overflow-hidden rounded-[var(--radius-panel)] border p-5 sm:p-6 ${
                  featured
                    ? "border-[var(--brand-strong)] bg-[var(--brand-strong)] text-white"
                    : "border-[var(--border)] bg-[#f7f4ef] text-slate-950"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`grid h-11 w-11 place-items-center rounded-full border ${
                      featured
                        ? "border-white/20 bg-white/10 text-white"
                        : "border-[var(--brand-border)] bg-white text-[var(--brand)]"
                    }`}
                    aria-hidden="true"
                  >
                    <ValueIcon name={item.icon} />
                  </span>
                  <span className={`text-xs font-bold tracking-[0.16em] ${featured ? "text-white/55" : "text-[var(--accent-strong)]"}`}>
                    {item.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold tracking-[-0.025em]">{item.title}</h3>
                <p className={`mt-3 text-sm leading-6 ${featured ? "text-white/72" : "text-slate-600"}`}>
                  {item.description}
                </p>

                <div
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-1 w-full ${
                    featured ? "bg-[var(--accent)]" : "bg-[var(--brand-border)]"
                  }`}
                />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ValueIcon({ name }: { name: (typeof valueItems)[number]["icon"] }) {
  if (name === "folder") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M3.5 7.5h6l2-2h9v13h-17v-11Z" />
        <path d="M3.5 9.5h17" />
      </svg>
    );
  }
  if (name === "source") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path d="M7 3.5h7l3 3V20H7V3.5Z" />
        <path d="M14 3.5V7h3.5M9.5 11.5h5M9.5 15h5" />
      </svg>
    );
  }
  if (name === "next") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m10 8 4 4-4 4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M12 3.5 19 6v5c0 4.4-2.7 7.8-7 9.5C7.7 18.8 5 15.4 5 11V6l7-2.5Z" />
      <path d="m9.5 12 1.6 1.6 3.7-4" />
    </svg>
  );
}
