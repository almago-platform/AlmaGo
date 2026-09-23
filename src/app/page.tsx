import Link from "next/link";

const journey = [
  {
    number: "01",
    title: "Compléter votre profil",
    description: "Rassemblez les informations académiques et votre projet d’études dans un dossier structuré.",
  },
  {
    number: "02",
    title: "Suivre vos documents",
    description: "Ajoutez les pièces utiles et retrouvez leur statut ainsi que les demandes de correction.",
  },
  {
    number: "03",
    title: "Comparer votre orientation",
    description: "Consultez les programmes recommandés, leurs critères visibles et les échéances enregistrées.",
  },
  {
    number: "04",
    title: "Suivre vos candidatures",
    description: "Gardez le statut, la prochaine action et l’historique de chaque candidature au même endroit.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <header className="border-b border-[var(--border)] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AlmaGo accueil">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] text-base font-bold text-white shadow-sm">
              A
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold leading-5 tracking-tight text-slate-950">AlmaGo</span>
              <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Études en Allemagne
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex" aria-label="Navigation principale">
            <a className="transition-colors hover:text-[var(--brand)]" href="#parcours">Comment ça marche</a>
            <a className="transition-colors hover:text-[var(--brand)]" href="#espace">Votre espace</a>
            <Link className="transition-colors hover:text-[var(--brand)]" href="/login">Connexion</Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/login"
              className="hidden min-h-11 items-center justify-center rounded-[var(--radius-control)] px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:inline-flex"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[var(--brand-strong)]"
            >
              Créer mon dossier
            </Link>
          </div>
        </div>
      </header>

      <section className="public-hero-grid border-b border-[var(--border)]">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(24rem,0.92fr)] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--brand-border)] bg-white px-4 py-2 text-sm font-bold text-[var(--brand)] shadow-sm">
              Votre dossier étudiant pour l’Allemagne
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.06] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Un seul espace pour préparer et suivre votre projet d’études en Allemagne.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              AlmaGo organise votre profil, vos documents, votre orientation et vos candidatures pour que vous sachiez ce qui est enregistré, ce qui reste à vérifier et quelle est la prochaine action.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 text-base font-bold text-white shadow-sm transition-colors hover:bg-[var(--brand-strong)]"
              >
                Créer mon dossier
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-6 text-base font-bold text-slate-900 shadow-sm transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                J’ai déjà un compte
              </Link>
            </div>

            <dl className="mt-10 grid gap-3 sm:grid-cols-3">
              <ValuePoint title="Profil structuré" detail="Votre projet au même endroit" />
              <ValuePoint title="Documents suivis" detail="Statut et corrections visibles" />
              <ValuePoint title="Candidatures lisibles" detail="Échéance et prochaine action" />
            </dl>
          </div>

          <aside
            className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white shadow-[var(--shadow-card)]"
            aria-label="Exemple d’interface du dossier AlmaGo"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Aperçu d’exemple</p>
                <h2 className="mt-1 text-lg font-bold text-slate-950">Mon dossier</h2>
              </div>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
                Espace étudiant
              </span>
            </div>

            <div className="p-5 sm:p-6">
              <div className="rounded-[var(--radius-panel)] bg-[var(--brand)] p-5 text-white">
                <p className="text-sm font-semibold text-indigo-100">Ce qui compte maintenant</p>
                <p className="mt-3 text-xl font-bold">Une prochaine action clairement identifiée</p>
                <p className="mt-2 text-sm leading-6 text-indigo-100">
                  Le tableau de bord rassemble le statut du dossier sans présenter une progression comme une décision d’admission.
                </p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <PreviewItem label="Documents" value="Statuts visibles" />
                <PreviewItem label="Orientation" value="Programmes à comparer" />
                <PreviewItem label="Candidatures" value="Échéances suivies" />
                <PreviewItem label="Démarches" value="Étapes regroupées" />
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Illustration de l’organisation de l’espace AlmaGo. Les informations réelles dépendent de votre dossier.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section id="parcours" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">
              Du profil à la candidature, chaque étape reste lisible.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              AlmaGo ne remplace pas les décisions des universités. La plateforme organise les informations et le suivi de votre dossier.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {journey.map((item) => (
              <article key={item.number} className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
                <span className="text-sm font-bold text-[var(--accent-strong)]">{item.number}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="espace" className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">Votre espace AlmaGo</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950">
              Vous voyez le dossier, pas seulement une liste de fichiers.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Les pages étudiant sont organisées autour d’une question simple : où en est le dossier et quelle action est utile maintenant ?
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Feature title="Mon dossier" description="Une synthèse des éléments enregistrés et de la priorité actuelle." />
            <Feature title="Mes documents" description="Les fichiers envoyés, leur statut et les messages de correction visibles." />
            <Feature title="Mon orientation" description="Les recommandations publiées, leurs critères et les programmes qui vous intéressent." />
            <Feature title="Mes candidatures" description="Les statuts, échéances, prochaines actions et historiques visibles." />
          </div>
        </div>
      </section>

      <section id="confiance" className="bg-white py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Prêt à commencer ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Créez votre espace et commencez par votre profil.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Créer mon dossier
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-6 font-bold text-slate-900 transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Connexion
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ValuePoint({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-white/90 px-4 py-3 shadow-sm">
      <dt className="text-sm font-bold text-slate-950">{title}</dt>
      <dd className="mt-1 text-xs leading-5 text-slate-500">{detail}</dd>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
