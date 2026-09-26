import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--surface-subtle)]" aria-labelledby="final-cta-title">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Commencer votre dossier</p>
          <h2 id="final-cta-title" className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-4xl">
            Votre projet peut commencer par une étape simple : le rendre lisible.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Créez votre espace, définissez votre projet et identifiez ce qui manque avant de passer aux candidatures et aux démarches suivantes.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            Créer mon dossier
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-6 font-bold text-slate-800 hover:border-[var(--brand)] hover:text-[var(--brand)]"
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_1fr]">
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

        <div className="mt-10 grid gap-3 border-t border-white/15 pt-6 text-xs leading-5 text-white/60 sm:grid-cols-[1fr_auto] sm:items-center">
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
