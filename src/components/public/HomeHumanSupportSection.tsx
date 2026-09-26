const supportSteps = [
  {
    title: "Comprendre",
    text: "Pourquoi cette étape compte et quelles informations sont réellement utiles.",
  },
  {
    title: "Préparer",
    text: "Ce qui doit être rassemblé, vérifié ou décidé avant de continuer.",
  },
  {
    title: "Avancer",
    text: "La prochaine action visible, sans perdre le fil entre deux démarches.",
  },
] as const;

export function HomeHumanSupportSection() {
  return (
    <section className="bg-white py-12 sm:py-14 lg:py-16" aria-labelledby="human-support-title">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="relative overflow-hidden rounded-[var(--radius-panel)] bg-[var(--brand-strong)] p-7 text-white sm:p-9 lg:p-10">
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full border-[34px] border-[var(--accent)]/20" />
          <div aria-hidden="true" className="absolute bottom-8 right-10 h-3 w-3 rounded-full bg-[var(--accent)]" />

          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Un accompagnement qui reste humain</p>
          <h2 id="human-support-title" className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
            Vous n’avez pas à garder tout le parcours dans votre tête.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72">
            AlmaGo transforme un projet complexe en repères simples : où vous en êtes, ce qui manque et ce qui mérite votre attention maintenant.
          </p>

          <div className="mt-8 border-t border-white/15 pt-5">
            <p className="text-sm font-bold text-white">Votre projet reste le vôtre.</p>
            <p className="mt-1 max-w-lg text-sm leading-6 text-white/62">
              AlmaGo organise et explique. Les admissions, visas et validations officielles restent du ressort des organismes compétents.
            </p>
          </div>
        </div>

        <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#f7f4ef] p-6 sm:p-8 lg:p-9">
          <p className="eyebrow">Comment AlmaGo vous guide</p>
          <div className="mt-5 divide-y divide-[#ded7cd]">
            {supportSteps.map((item, index) => (
              <div key={item.title} className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr]">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-bold text-[var(--brand)] shadow-sm">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="#espace"
            className="mt-7 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            Voir comment le dossier vous accompagne
          </a>
        </div>
      </div>
    </section>
  );
}
