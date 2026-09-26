import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section className="bg-[var(--brand)] text-white" aria-labelledby="final-cta-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Commencer votre dossier</p>
          <h2 id="final-cta-title" className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-[2.8rem]">
            Rendez votre projet lisible avant qu’il devienne urgent.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
            Créez votre espace, définissez votre projet et gardez une vue claire sur les documents, les pistes et les prochaines démarches.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/72">
            <span>✓ Dossier structuré</span>
            <span>✓ Prochaine action visible</span>
            <span>✓ Sources importantes identifiées</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-white px-7 font-bold text-[var(--brand)] hover:bg-[var(--brand-soft)]"
          >
            Créer mon dossier
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-white/30 bg-white/5 px-7 font-bold text-white hover:bg-white/10"
          >
            Connexion
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeFooter() {
  return (
    <footer className="bg-[var(--brand-strong)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="AlmaGo accueil">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-white text-sm font-bold text-[var(--brand)]">A</span>
              <span>
                <span className="block text-base font-bold">AlmaGo</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Études en Allemagne</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-white/70">
              Un espace indépendant pour structurer un projet d’études en Allemagne, suivre les faits du dossier et garder les sources officielles visibles.
            </p>
          </div>

          <FooterColumn title="Parcours" links={[["Les 6 étapes", "#parcours"], ["Espace étudiant", "#espace"]]} />
          <FooterColumn title="Confiance" links={[["Sources & limites", "#confiance"], ["Questions fréquentes", "#faq"]]} />
          <FooterColumn title="Compte" links={[["Créer mon dossier", "/signup"], ["Connexion", "/login"]]} />
        </div>

        <div className="mt-8 grid gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-white/60 sm:grid-cols-[1fr_auto] sm:items-center">
          <p>© AlmaGo · Plateforme indépendante de structuration d’un projet d’études en Allemagne.</p>
          <p>Admission, visa et titre de séjour : décisions des organismes compétents.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/55">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-white/85 hover:text-white hover:underline hover:underline-offset-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
