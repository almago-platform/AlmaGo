import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";

export const metadata: Metadata = {
  title: "À propos d’AlmaGo",
  description:
    "Découvrez la mission d’AlmaGo et la manière dont le service accompagne la préparation d’un projet d’études en Allemagne.",
};

const principles = [
  {
    number: "01",
    title: "Rendre le parcours plus lisible",
    text:
      "Un projet d’études peut réunir beaucoup d’informations, de documents et de délais. AlmaGo cherche à les organiser pour que l’étudiant comprenne ce qui est prêt, ce qui manque et ce qui vient ensuite.",
  },
  {
    number: "02",
    title: "Rester proche des sources",
    text:
      "Lorsqu’une règle dépend d’une université ou d’un organisme officiel, AlmaGo doit faciliter le retour vers cette source plutôt que présenter une information secondaire comme une décision définitive.",
  },
  {
    number: "03",
    title: "Séparer accompagnement et décision",
    text:
      "AlmaGo peut aider à préparer, comparer, suivre et expliquer. Les décisions d’admission, d’éligibilité et d’autorisation restent du ressort des organismes compétents.",
  },
  {
    number: "04",
    title: "Parler simplement",
    text:
      "Les démarches administratives sont déjà assez complexes. Le service doit employer un langage clair, éviter le jargon inutile et expliquer les termes lorsqu’ils sont nécessaires.",
  },
] as const;

const standards = [
  "Un dossier personnel structuré plutôt qu’une accumulation de pages séparées.",
  "Des prochaines étapes compréhensibles plutôt que des messages vagues.",
  "Des sources officielles visibles lorsque l’information s’y prête.",
  "Des limites clairement indiquées lorsque quelque chose n’est pas certain.",
  "Aucun classement arbitraire des programmes ni promesse artificielle d’admission.",
  "Des informations personnelles conservées dans l’espace privé prévu à cet effet.",
] as const;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            À propos d’AlmaGo
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Un service conçu pour rendre un projet d’études plus clair à chaque étape.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            AlmaGo organise les informations, les documents, les démarches et les candidatures qui composent un projet d’études en Allemagne. L’objectif est simple : aider l’étudiant à comprendre sa situation et sa prochaine étape sans lui donner une fausse impression de certitude.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="mission-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <div>
            <p className="eyebrow">Notre mission</p>
            <h2 id="mission-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Aider l’étudiant à garder le contrôle de son dossier.
            </h2>
          </div>
          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <p className="text-base leading-7 text-slate-700">
              AlmaGo part d’un constat simple : entre les conditions d’admission, les documents, les traductions, les candidatures et les échéances, il est facile de perdre la vue d’ensemble.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-700">
              Le service cherche donc à réunir les éléments utiles dans un même parcours, à distinguer ce qui demande une action de l’étudiant de ce qui est encore en suivi, et à garder les décisions officielles clairement séparées du suivi interne.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="approach-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Notre manière de travailler</p>
            <h2 id="approach-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Quatre principes pour garder l’accompagnement utile et crédible.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {principles.map((item) => (
              <article
                key={item.number}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                    {item.number}
                  </span>
                  <span aria-hidden="true" className="h-1.5 w-10 rounded-full bg-[var(--accent)]" />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-18" aria-labelledby="standards-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">Ce que vous pouvez attendre</p>
            <h2 id="standards-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Des standards visibles dans le service lui-même.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Le professionnalisme ne doit pas seulement apparaître dans le design. Il doit se retrouver dans la manière dont le dossier, les sources et les prochaines étapes sont présentés.
            </p>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
            <ul className="space-y-4 text-sm leading-6 text-slate-700">
              {standards.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-xs font-bold text-[var(--brand)]"
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Confiance</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Comprendre exactement le rôle d’AlmaGo.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Retrouvez les principes de transparence, la place des sources officielles et les limites du service.
            </p>
            <Link
              href="/confiance"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Confiance et transparence
            </Link>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Besoin d’un repère ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Retrouvez les principales démarches dans le Centre d’aide.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Dossier, documents, orientation, candidatures et démarches administratives sont regroupés par sujet.
            </p>
            <Link
              href="/aide"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-5 text-sm font-bold text-[var(--brand)] transition-colors hover:border-[var(--brand)]"
            >
              Ouvrir le Centre d’aide
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
