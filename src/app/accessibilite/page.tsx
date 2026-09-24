import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

export const metadata: Metadata = {
  title: "Accessibilité | AlmaGo",
  description:
    "Découvrez les choix d’accessibilité mis en place dans AlmaGo et les principes suivis pour rendre les démarches plus faciles à utiliser.",
};

const measures = [
  {
    title: "Navigation au clavier",
    text:
      "Les éléments interactifs importants sont conçus pour rester accessibles au clavier, avec un accès direct au contenu principal dans les espaces privés.",
  },
  {
    title: "Libellés compréhensibles",
    text:
      "Les boutons, formulaires, menus et états utilisent des intitulés explicites. Les informations essentielles ne reposent pas uniquement sur une couleur ou une icône.",
  },
  {
    title: "Lecture sur différents écrans",
    text:
      "Les pages publiques et les espaces étudiant et administration sont contrôlés sur plusieurs tailles d’écran afin de préserver la lisibilité et les actions principales.",
  },
  {
    title: "Structure des pages",
    text:
      "Titres, sections, listes, messages d’état et repères de navigation sont structurés pour faciliter la lecture et l’utilisation avec les technologies d’assistance.",
  },
] as const;

export default function AccessibilityPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <PublicBreadcrumbs items={[{ label: "Accessibilité" }]} />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Accessibilité
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Des démarches qui doivent rester compréhensibles et utilisables.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            AlmaGo cherche à réduire les obstacles inutiles dans la navigation, la lecture et la compréhension du dossier étudiant.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="accessibility-measures-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Ce qui est déjà pris en compte</p>
            <h2 id="accessibility-measures-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Des choix intégrés directement dans l’expérience.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Ces mesures décrivent le fonctionnement actuel du site. Elles ne constituent pas une déclaration de conformité à une norme ou une certification externe.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {measures.map((measure) => (
              <article
                key={measure.title}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span
                  aria-hidden="true"
                  className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]"
                >
                  ✓
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{measure.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{measure.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="accessibility-quality-title">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">Contrôle qualité</p>
            <h2 id="accessibility-quality-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Vérifier avant de publier.
            </h2>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-6 sm:p-8">
            <p className="text-base leading-7 text-slate-700">
              Les changements publics d’AlmaGo passent par des contrôles navigateur qui couvrent notamment le responsive et des vérifications automatisées d’accessibilité.
            </p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Une vérification automatisée ne remplace pas tous les tests humains. Les nouvelles fonctionnalités doivent donc rester simples, explicites et testables au clavier et sur mobile.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Besoin d’un repère ?
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Utilisez le Centre d’aide pour retrouver la bonne démarche.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                Les informations sont regroupées par sujet afin d’éviter de devoir connaître à l’avance le terme administratif exact.
              </p>
            </div>
            <Link
              href="/aide"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
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
