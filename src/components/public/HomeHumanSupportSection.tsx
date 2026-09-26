import Image from "next/image";

const supportSteps = [
  {
    title: "Comprendre ce qui compte",
    text: "Chaque étape explique son objectif, les informations utiles et ce qui reste à vérifier.",
  },
  {
    title: "Préparer sans se disperser",
    text: "Votre projet, vos documents, vos candidatures et vos démarches restent reliés dans le même parcours.",
  },
  {
    title: "Savoir quoi faire ensuite",
    text: "AlmaGo met en avant la prochaine action enregistrée et distingue clairement votre action du suivi AlmaGo.",
  },
] as const;

export function HomeHumanSupportSection() {
  return (
    <section className="border-y border-[var(--border)] bg-[#f7f4ef] py-16 sm:py-20 lg:py-24" aria-labelledby="human-support-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(22rem,0.88fr)_minmax(0,1.12fr)] lg:items-center lg:gap-16 lg:px-8">
        <figure className="relative overflow-hidden rounded-[calc(var(--radius-panel)+0.35rem)] border border-[#ded7cd] bg-white">
          <Image
            src="https://images.unsplash.com/photo-1778735940467-1335c201966d?auto=format&fit=crop&w=1400&q=82"
            alt="Étudiant travaillant à une table de bibliothèque avec un ordinateur et des notes."
            width={1400}
            height={1000}
            className="h-[22rem] w-full object-cover sm:h-[28rem] lg:h-[31rem]"
            sizes="(min-width: 1024px) 42vw, 100vw"
          />
          <figcaption className="absolute inset-x-4 bottom-4 rounded-[var(--radius-panel)] border border-white/70 bg-white/92 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-strong)]">Votre projet reste le vôtre</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              AlmaGo vous aide à organiser les informations et à garder une prochaine étape visible.
            </p>
          </figcaption>
        </figure>

        <div>
          <p className="eyebrow">Un accompagnement qui reste humain</p>
          <h2 id="human-support-title" className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[2.8rem]">
            Vous n’avez pas à garder tout le parcours dans votre tête.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Étudier en Allemagne implique des décisions, des documents, des délais et plusieurs interlocuteurs. AlmaGo transforme ce parcours en étapes lisibles pour que vous sachiez où vous en êtes et ce qui mérite votre attention maintenant.
          </p>

          <div className="mt-8 border-y border-[#ded7cd]">
            {supportSteps.map((item, index) => (
              <div key={item.title} className="grid gap-3 border-b border-[#ded7cd] py-5 last:border-b-0 sm:grid-cols-[2.5rem_1fr]">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--brand)] text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-l-2 border-[var(--accent)] pl-4">
            <p className="text-sm font-bold text-slate-900">AlmaGo organise et explique. Les organismes compétents décident.</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Les admissions, visas et validations officielles restent du ressort des universités et autorités concernées.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
