import Link from "next/link";

export function HomeFinalCta() {
  return (
    <section className="bg-[var(--brand)] text-white" aria-labelledby="final-cta-title">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">Commencer avec AlmaGo</p>
          <h2 id="final-cta-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
            Prêt à structurer votre projet d’études en Allemagne ?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-indigo-100">
            Créez votre espace et commencez par votre profil. Votre dossier pourra ensuite rassembler les éléments utiles à votre parcours.
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-white px-6 font-bold text-[var(--brand)] shadow-[0_16px_34px_-22px_rgba(0,0,0,0.65)] transition-all hover:-translate-y-px hover:bg-slate-50"
          >
            Créer mon dossier
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-white/30 bg-white/5 px-6 font-bold text-white transition-colors hover:bg-white/10"
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
    <footer className="bg-[#171c55] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-9 sm:grid-cols-2 xl:grid-cols-[1.3fr_0.9fr_1fr_0.8fr_0.8fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="AlmaGo accueil">
              <span className="relative grid h-10 w-10 place-items-center rounded-[var(--radius-control)] bg-white text-sm font-bold text-[var(--brand)]">
                A
                <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-[#171c55] bg-[var(--accent)]" />
              </span>
              <span>
                <span className="block text-lg font-bold">AlmaGo</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-200">Études en Allemagne</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-indigo-200">
              Un espace structuré pour organiser votre projet d’études, vos documents, votre orientation et le suivi de vos candidatures.
            </p>
          </div>

          <FooterColumn
            title="AlmaGo"
            links={[
              ["À propos d’AlmaGo", "/a-propos"],
              ["Notre rôle", "/#role"],
              ["Confiance et transparence", "/confiance"],
            ]}
          />
          <FooterColumn
            title="Parcours"
            links={[
              ["Comment ça marche", "/#parcours"],
              ["Comprendre les démarches", "/comprendre-les-demarches"],
              ["Selon votre pays de diplôme", "/selon-votre-pays"],
              ["Votre espace", "/#espace"],
            ]}
          />
          <FooterColumn
            title="Compte"
            links={[
              ["Créer mon dossier", "/signup"],
              ["Connexion", "/login"],
            ]}
          />
          <FooterColumn
            title="Aide"
            links={[
              ["Centre d’aide", "/aide"],
              ["Sources officielles", "/sources-officielles"],
              ["Questions fréquentes", "/#faq"],
              ["Pourquoi AlmaGo", "/#why-almago-title"],
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-indigo-200 sm:flex-row sm:items-center sm:justify-between">
          <p>© AlmaGo · Service de préparation et de suivi d’un projet d’études en Allemagne.</p>
          <p>Les informations officielles restent à vérifier auprès des organismes compétents.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">{title}</p>
      <ul className="mt-4 space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="text-white/90 transition-colors hover:text-white hover:underline hover:underline-offset-4">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
