import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";

export const metadata: Metadata = {
  title: "Selon votre pays de diplôme | AlmaGo",
  description:
    "Comprendre quelles informations vérifier selon le pays et le type de diplôme utilisés pour candidater en Allemagne.",
};

const checks = [
  {
    number: "01",
    title: "Votre diplôme permet-il un accès direct ?",
    text:
      "Selon le type de certificat, le pays où il a été obtenu et les études déjà suivies, l’accès peut être direct, limité à certains domaines ou nécessiter une préparation supplémentaire.",
  },
  {
    number: "02",
    title: "Des documents particuliers sont-ils demandés ?",
    text:
      "Certaines procédures demandent des documents supplémentaires, des relevés précis, un examen d’entrée antérieur ou des justificatifs liés au parcours scolaire et universitaire.",
  },
  {
    number: "03",
    title: "Quelles règles de traduction ou de certification s’appliquent ?",
    text:
      "Les exigences peuvent varier selon l’origine des documents et la procédure utilisée. Vérifiez qui peut traduire les pièces et sous quelle forme elles doivent être transmises.",
  },
  {
    number: "04",
    title: "Que demande l’université elle-même ?",
    text:
      "Même lorsque votre qualification permet l’accès aux études, l’université peut fixer ses propres critères de langue, de délai, de sélection ou de dossier.",
  },
] as const;

export default function CountryGuidancePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Selon votre pays de diplôme
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Commencez par votre parcours scolaire, pas uniquement par votre nationalité.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Pour étudier en Allemagne, les règles peuvent dépendre du pays où vos diplômes ont été obtenus,
            du type de certificat, de vos études déjà réalisées et du programme choisi.
          </p>
          <div className="mt-7 rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5 text-sm leading-6 text-indigo-100">
            Cette page vous aide à savoir quoi vérifier. Elle ne détermine pas votre admission et ne remplace
            pas l’évaluation de l’université ou de l’organisme compétent.
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="country-checks-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Avant de candidater</p>
            <h2 id="country-checks-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Quatre vérifications à faire pour votre situation.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {checks.map((item) => (
              <article
                key={item.number}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                    {item.number}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="official-tools-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Outils officiels</p>
            <h2 id="official-tools-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Vérifiez votre situation auprès des bonnes sources.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Utilisez ces outils comme point de départ, puis confirmez toujours les exigences du programme
              directement auprès de l’université.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-3">
            <SourceCard
              eyebrow="Documents"
              title="Informations par pays — uni-assist"
              text="Consultez les notes particulières sur les documents et les traductions pour les pays où uni-assist publie des exigences supplémentaires."
              href="https://www.uni-assist.de/en/tools/info-country-by-country/"
              action="Consulter uni-assist"
            />
            <SourceCard
              eyebrow="Accès aux études"
              title="Base d’admission — DAAD"
              text="Obtenez une première orientation sur la manière dont votre qualification scolaire ou universitaire peut être considérée pour l’accès aux études en Allemagne."
              href="https://www2.daad.de/deutschland/nach-deutschland/voraussetzungen/en/57293-database-on-admission-requirements"
              action="Ouvrir la base DAAD"
            />
            <SourceCard
              eyebrow="Programme choisi"
              title="Page officielle de l’université"
              text="La dernière vérification doit toujours porter sur le programme lui-même : critères, langue, documents, procédure et date limite peuvent varier."
              href="https://www.hochschulkompass.de/en/degree-programmes.html"
              action="Rechercher un programme"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Besoin de comprendre un terme ?
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                VPD, NC, Studienkolleg, TestAS…
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                Consultez nos explications simples avant de revenir à la source officielle correspondant à votre dossier.
              </p>
            </div>
            <Link
              href="/comprendre-les-demarches"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
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

function SourceCard({
  eyebrow,
  title,
  text,
  href,
  action,
}: Readonly<{
  eyebrow: string;
  title: string;
  text: string;
  href: string;
  action: string;
}>) {
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
      >
        {action}
      </a>
    </article>
  );
}
