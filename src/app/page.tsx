const steps = [
  {
    title: "Diagnostic du profil",
    text: "On clarifie ton parcours, ton niveau, tes documents et tes objectifs avant de proposer une route.",
  },
  {
    title: "Dossier et documents",
    text: "Passeport, traductions, attestations et pièces importantes sont suivis dans un espace unique.",
  },
  {
    title: "Orientation Allemagne",
    text: "Les programmes recommandés restent lisibles, comparables et reliés à la prochaine action utile.",
  },
];

const trustSignals = ["Parcours TN -> DE", "Suivi dossier", "Espace étudiant", "Étapes vérifiables"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,135,90,0.12),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f4f7f6_100%)] text-slate-950">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="flex items-center gap-3" aria-label="AlmaGo accueil">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white shadow-sm">
            A
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">AlmaGo</span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Études en Allemagne
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex" aria-label="Navigation principale">
          <a className="transition hover:text-emerald-800" href="#parcours">
            Parcours
          </a>
          <a className="transition hover:text-emerald-800" href="#confiance">
            Confiance
          </a>
          <a className="transition hover:text-emerald-800" href="/login">
            Connexion
          </a>
        </nav>
        <a
          href="/login"
          className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
        >
          Accéder à mon espace
        </a>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            Accompagnement structuré Tunisie -> Allemagne
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
            Construis ton dossier d'études en Allemagne avec une méthode claire.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            AlmaGo transforme ton projet en étapes simples : profil, documents, orientation,
            candidatures et suivi. Tu sais toujours quoi faire, pourquoi le faire et ce qui
            reste à valider.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Commencer mon dossier
            </a>
            <a
              href="#parcours"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-bold text-slate-900 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
            >
              Voir les étapes
            </a>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
            {trustSignals.map((signal) => (
              <div key={signal} className="rounded-lg border border-slate-200 bg-white/80 px-4 py-3 shadow-sm">
                {signal}
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)]" aria-label="Aperçu du dossier AlmaGo">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Dossier étudiant</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Prochaine action claire</h2>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">À faire</span>
          </div>
          <div className="mt-6 rounded-xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-emerald-200">Progression du dossier</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <span className="text-5xl font-bold">14%</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold">1 sur 7 étapes</span>
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/18">
              <div className="h-full w-[14%] rounded-full bg-emerald-300" />
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Action prioritaire</p>
              <p className="mt-2 text-lg font-bold text-slate-950">Ajouter ton passeport</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Équipe AlmaGo</p>
              <p className="mt-2 text-lg font-bold text-slate-950">Analyse à venir</p>
            </div>
          </div>
        </aside>
      </section>

      <section id="parcours" className="border-y border-slate-200 bg-white/80 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Parcours AlmaGo</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Un chemin lisible, pas une liste confuse.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chaque page doit répondre à une question simple : où j'en suis, ce qui manque,
              et quelle décision prendre ensuite.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-sm font-bold text-emerald-800">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="confiance" className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Pourquoi c'est rassurant</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Une interface qui donne confiance dès la première minute.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-950">Informations centralisées</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Le profil, les documents et les candidatures restent dans un espace cohérent.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-950">Étapes vérifiables</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Les actions importantes sont visibles, priorisées et reliées au dossier.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-950">Ton professionnel</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">Le design reste sobre, sérieux et compatible avec une marque d'accompagnement.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-slate-950">Évolution progressive</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">On peut enrichir page par page sans casser l'authentification ni les données.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
