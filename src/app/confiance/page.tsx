import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

export const metadata: Metadata = {
  title: "Confiance et transparence | AlmaGo",
  description:
    "Comprendre le rôle d’AlmaGo, la place des sources officielles et les limites du service dans votre projet d’études en Allemagne.",
};

const principles = [
  {
    title: "Votre dossier reste compréhensible",
    text:
      "AlmaGo rassemble les informations utiles de votre projet pour rendre visibles vos documents, vos démarches, vos pistes d’orientation et vos candidatures.",
  },
  {
    title: "La source officielle reste la référence",
    text:
      "Lorsqu’un lien officiel est enregistré pour un programme, AlmaGo le présente directement. Une condition, une date limite ou une procédure importante doit toujours être vérifiée auprès de l’établissement ou de l’organisme compétent.",
  },
  {
    title: "Une piste n’est pas une décision",
    text:
      "Une piste d’orientation, un statut de dossier ou une progression dans AlmaGo ne constitue ni une admission, ni une décision d’éligibilité, ni une décision de visa ou de séjour.",
  },
  {
    title: "L’incertitude doit rester visible",
    text:
      "Si une information officielle manque dans le catalogue, AlmaGo doit le signaler au lieu de donner une impression artificielle de certitude.",
  },
] as const;

export default function TrustPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <PublicBreadcrumbs items={[{ label: "Confiance et transparence" }]} />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Confiance et transparence
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Comprendre ce qu’AlmaGo fait pour vous — et ce qu’AlmaGo ne décide pas.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Un service sérieux doit expliquer clairement son rôle. AlmaGo organise votre projet d’études et votre suivi ;
            les décisions officielles restent celles des universités, autorités et organismes compétents.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="trust-principles-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Nos principes</p>
            <h2 id="trust-principles-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Une information utile doit aussi être une information bien située.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {principles.map((item, index) => (
              <article
                key={item.title}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-soft)] text-sm font-bold text-[var(--brand)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="trust-role-title">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/45 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Avec AlmaGo</p>
            <h2 id="trust-role-title" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Ce que le service organise.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <TrustItem>Votre profil et les informations utiles à votre projet.</TrustItem>
              <TrustItem>Le suivi des documents déposés dans votre espace étudiant.</TrustItem>
              <TrustItem>Des pistes d’orientation et leurs critères enregistrés.</TrustItem>
              <TrustItem>Vos candidatures, échéances et prochaines étapes enregistrées.</TrustItem>
              <TrustItem>Des explications et des liens vers des sources officielles.</TrustItem>
            </ul>
          </article>

          <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Décisions officielles</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Ce qui reste hors du rôle d’AlmaGo.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
              <TrustItem>Décider de votre admission dans une université.</TrustItem>
              <TrustItem>Garantir votre éligibilité à un programme.</TrustItem>
              <TrustItem>Prendre une décision de visa ou de titre de séjour.</TrustItem>
              <TrustItem>Remplacer les conditions publiées par une université.</TrustItem>
              <TrustItem>Transformer une progression interne en probabilité de réussite.</TrustItem>
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16" aria-labelledby="trust-sources-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">Nos sources</p>
              <h2 id="trust-sources-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Vérifier avant de décider.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Pour les informations importantes, AlmaGo doit faciliter le retour vers l’organisme qui fait autorité.
              </p>
            </div>

            <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <div className="grid gap-5 sm:grid-cols-3">
                <SourceRule title="Programme">
                  Université ou page officielle du programme.
                </SourceRule>
                <SourceRule title="Procédure">
                  Université, uni-assist ou organisme explicitement indiqué.
                </SourceRule>
                <SourceRule title="Séjour / visa">
                  Autorité publique compétente.
                </SourceRule>
              </div>
              <p className="mt-6 border-t border-[var(--border)] pt-5 text-sm leading-6 text-slate-600">
                AlmaGo ne doit afficher une mention de vérification datée que lorsqu’une vérification réelle a été effectuée.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Besoin d’aide ?</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Retrouvez l’explication adaptée à votre étape.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                Le Centre d’aide rassemble les principaux sujets du dossier, de l’orientation et des candidatures.
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

function TrustItem({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <li className="flex gap-3">
      <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--accent)]" />
      <span>{children}</span>
    </li>
  );
}

function SourceRule({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div>
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
}
