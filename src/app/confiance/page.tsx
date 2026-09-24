import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";

export const metadata: Metadata = {
  title: "Confiance et transparence | AlmaGo",
  description:
    "Comprendre le rôle d’AlmaGo, la place des sources officielles et les limites du suivi proposé pour un projet d’études en Allemagne.",
};

const principles = [
  {
    title: "Votre dossier reste lisible",
    text:
      "AlmaGo regroupe les informations utiles à votre projet afin que vous puissiez voir ce qui est enregistré, ce qui demande votre attention et ce qui vient ensuite.",
  },
  {
    title: "Les sources officielles restent la référence",
    text:
      "Pour les conditions d’admission, les dates limites, les niveaux de langue et les procédures, AlmaGo vous encourage à consulter la page officielle de l’université ou de l’organisme concerné.",
  },
  {
    title: "Une piste n’est pas une admission",
    text:
      "Une piste d’orientation aide à examiner un programme. Elle ne constitue ni une décision d’éligibilité, ni une admission, ni une garantie de résultat.",
  },
  {
    title: "Les statuts AlmaGo décrivent le suivi",
    text:
      "Un document vérifié, une étape terminée ou une candidature suivie décrit l’état enregistré dans AlmaGo. Cela ne remplace pas le statut officiel communiqué par un établissement ou une autorité.",
  },
] as const;

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Confiance et transparence
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Savoir ce qu’AlmaGo fait, et ce qui reste une décision officielle.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Un accompagnement sérieux commence par des rôles clairs. AlmaGo organise votre dossier et votre suivi ;
            les universités, autorités et organismes compétents conservent leurs propres décisions et exigences.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="trust-principles-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Nos principes</p>
            <h2 id="trust-principles-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Une information utile doit aussi être compréhensible dans sa portée.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {principles.map((principle, index) => (
              <article
                key={principle.title}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-slate-950">{principle.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{principle.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="sources-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">Sources officielles</p>
            <h2 id="sources-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Vérifier avant de décider.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Lorsqu’un lien officiel est disponible dans une fiche programme, AlmaGo le rend visible pour que vous puissiez contrôler les informations importantes à leur origine.
            </p>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-6 sm:p-8">
            <p className="text-sm font-bold text-[var(--brand)]">Ce qui mérite toujours une vérification officielle</p>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-700 sm:grid-cols-2">
              <TrustItem>Conditions d’admission</TrustItem>
              <TrustItem>Dates limites</TrustItem>
              <TrustItem>Niveaux de langue</TrustItem>
              <TrustItem>Documents demandés</TrustItem>
              <TrustItem>Voie de candidature</TrustItem>
              <TrustItem>Décision et statut officiels</TrustItem>
            </ul>
            <p className="mt-5 text-xs leading-5 text-slate-500">
              Lorsqu’aucun lien officiel n’est enregistré dans AlmaGo, l’interface doit le dire clairement au lieu de laisser croire qu’une information a été vérifiée.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16" aria-labelledby="privacy-trust-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre espace</p>
              <h2 id="privacy-trust-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Vos documents appartiennent à votre dossier privé.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Les pièces du dossier étudiant sont consultées dans l’espace authentifié. Elles ne doivent pas devenir du contenu public du site.
              </p>
            </article>

            <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Décisions officielles</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                AlmaGo n’attribue ni admission, ni visa, ni décision administrative.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Les résultats officiels restent ceux communiqués par l’université, l’autorité ou l’organisme compétent. AlmaGo vous aide à garder leur suivi compréhensible dans votre dossier.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Besoin d’une explication ?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Retrouvez les démarches et les réponses utiles dans le Centre d’aide.
              </h2>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/aide"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
              >
                Centre d’aide
              </Link>
              <Link
                href="/comprendre-les-demarches"
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-5 text-sm font-bold text-[var(--brand)]"
              >
                Comprendre les démarches
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}

function TrustItem({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
      <span>{children}</span>
    </li>
  );
}
