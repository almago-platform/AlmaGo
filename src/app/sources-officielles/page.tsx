import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

export const metadata: Metadata = {
  title: "Sources officielles | AlmaGo",
  description:
    "Retrouvez les principales sources institutionnelles à vérifier pour les études, les candidatures et le séjour en Allemagne.",
};

const sources = [
  {
    category: "Candidature internationale",
    name: "uni-assist",
    text:
      "Pour les candidatures traitées par uni-assist : documents, traductions, VPD, délais de traitement et procédure My assist. L’université reste la référence pour savoir si votre candidature passe par uni-assist.",
    href: "https://www.uni-assist.de/en/",
    action: "Ouvrir uni-assist",
  },
  {
    category: "Votre pays de diplôme",
    name: "uni-assist — informations par pays",
    text:
      "Pour vérifier les exigences supplémentaires publiées par uni-assist selon le pays d’origine de vos documents scolaires ou universitaires.",
    href: "https://www.uni-assist.de/en/tools/info-country-by-country/",
    action: "Voir les informations par pays",
  },
  {
    category: "Accès aux études",
    name: "DAAD — base des conditions d’admission",
    text:
      "Pour obtenir une première orientation sur la manière dont une qualification étrangère peut ouvrir l’accès aux études supérieures en Allemagne.",
    href: "https://www2.daad.de/deutschland/nach-deutschland/voraussetzungen/en/57293-database-on-admission-requirements",
    action: "Ouvrir la base DAAD",
  },
  {
    category: "Programmes en Allemagne",
    name: "Hochschulkompass",
    text:
      "Pour rechercher des établissements et des programmes allemands. Les informations sur les programmes y sont renseignées et mises à jour par les établissements eux-mêmes.",
    href: "https://www.hochschulkompass.de/en/degree-programmes.html",
    action: "Rechercher un programme",
  },
  {
    category: "Visa et séjour",
    name: "Make it in Germany",
    text:
      "Portail officiel du gouvernement fédéral pour comprendre les principales conditions liées au visa d’études, au financement et au séjour.",
    href: "https://www.make-it-in-germany.com/en/visa-residence/types/studying",
    action: "Voir le visa pour études",
  },
  {
    category: "Depuis la Tunisie",
    name: "Ambassade d’Allemagne à Tunis — préparation aux études",
    text:
      "Pour les candidats déposant depuis la Tunisie : documents et conditions publiés pour une préparation aux études, notamment base académique, cours préparatoire et niveau de langue.",
    href: "https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573166-2573166",
    action: "Voir la checklist de Tunis",
  },
  {
    category: "Visa et représentation allemande",
    name: "Ministère fédéral des Affaires étrangères",
    text:
      "Pour les règles générales du visa étudiant et pour revenir vers la représentation allemande compétente selon votre lieu de résidence.",
    href: "https://www.auswaertiges-amt.de/en/visa-service/buergerservice/faq/08-studentenvisum-606690",
    action: "Consulter le ministère",
  },
] as const;

const verificationOrder = [
  {
    title: "1. Commencez par le programme",
    text:
      "Vérifiez d’abord la page officielle de l’université : conditions d’admission, langue, documents, procédure et date limite.",
  },
  {
    title: "2. Vérifiez ensuite la procédure",
    text:
      "Si l’université utilise uni-assist, Hochschulstart ou un autre portail, suivez les instructions publiées par l’établissement.",
  },
  {
    title: "3. Contrôlez votre qualification",
    text:
      "Utilisez les outils officiels d’orientation sur l’accès aux études, puis tenez compte de l’évaluation réellement demandée par l’université.",
  },
  {
    title: "4. Traitez visa et séjour séparément",
    text:
      "Les conditions d’admission universitaire et les conditions d’entrée ou de séjour ne sont pas la même décision. Vérifiez chacune auprès de l’autorité compétente.",
  },
] as const;

export default function OfficialSourcesPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <PublicBreadcrumbs items={[{ label: "Sources officielles" }]} />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Sources officielles
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Revenez toujours à l’organisme qui fait autorité.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            AlmaGo peut organiser et expliquer votre parcours. Pour une condition d’admission, une procédure de candidature
            ou une règle de visa, la décision et l’information de référence restent celles de l’université ou de l’organisme compétent.
          </p>
          <div className="mt-7 max-w-4xl rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5 text-sm leading-6 text-indigo-100">
            Les organismes listés ici sont des sources de référence. Leur présence sur cette page ne signifie pas qu’ils sont partenaires,
            sponsors ou affiliés à AlmaGo.
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="sources-list-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">À vérifier selon votre démarche</p>
            <h2 id="sources-list-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Les principales sources à connaître.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Vous n’avez pas besoin de toutes les utiliser. Choisissez la source qui correspond réellement à votre situation.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sources.map((source) => (
              <article
                key={source.name}
                className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                  {source.category}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{source.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{source.text}</p>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                >
                  {source.action}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="verification-order-title">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <p className="eyebrow">Ordre de vérification</p>
            <h2 id="verification-order-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Vérifiez dans le bon ordre.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Cela évite d’appliquer une règle générale à un programme qui possède sa propre procédure.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {verificationOrder.map((item) => (
              <article
                key={item.title}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-5"
              >
                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre qualification</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Commencez par le pays où votre diplôme a été obtenu.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Les documents et les voies d’accès peuvent dépendre du parcours scolaire utilisé pour candidater.
            </p>
            <Link
              href="/selon-votre-pays"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Vérifier selon mon parcours
            </Link>
          </div>

          <div className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Besoin d’une explication ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Comprenez d’abord le terme, puis revenez à la source.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              VPD, NC, HZB, Studienkolleg, TestAS et autres démarches sont expliqués en langage simple.
            </p>
            <Link
              href="/comprendre-les-demarches"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-5 text-sm font-bold text-[var(--brand)] transition-colors hover:border-[var(--brand)]"
            >
              Comprendre les démarches
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
