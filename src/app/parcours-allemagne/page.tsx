import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

export const metadata: Metadata = {
  title: "Parcours Allemagne : études puis visa | AlmaGo",
  description:
    "Comprendre le parcours pour étudier en Allemagne : projet académique, candidature, admission ou préparation, puis visa adapté à votre situation.",
};

const academicSteps = [
  {
    number: "01",
    title: "Définir votre projet d’études",
    text:
      "Commencez par le diplôme visé, le domaine, la langue d’études et la rentrée souhaitée. Le bon parcours dépend d’abord de ce projet académique.",
  },
  {
    number: "02",
    title: "Vérifier votre accès et les exigences",
    text:
      "Votre diplôme antérieur, vos études déjà réalisées, la langue et les critères du programme déterminent si vous pouvez candidater directement ou si une préparation est nécessaire.",
  },
  {
    number: "03",
    title: "Identifier la procédure de candidature",
    text:
      "Selon l’université, vous pouvez candidater directement, passer par uni-assist ou demander une VPD avant une candidature auprès de l’établissement.",
  },
  {
    number: "04",
    title: "Obtenir une base académique claire",
    text:
      "Admission définitive, admission conditionnelle, confirmation de candidature ou autre base académique reconnue : c’est cette situation qui permet ensuite d’identifier la bonne voie de séjour.",
  },
] as const;

const routes = [
  {
    eyebrow: "Admission définitive",
    title: "Vous avez une place d’études",
    text:
      "Lorsque vous avez une admission dans un établissement reconnu et que les autres conditions sont remplies, la voie principale est le visa pour études. Le séjour d’études relève du §16b AufenthG.",
    action: "Vérifier le visa pour études",
    href: "https://www.make-it-in-germany.com/en/visa-residence/types/studying",
    tone: "brand",
  },
  {
    eyebrow: "Préparation aux études",
    title: "Vous devez encore préparer la langue ou l’accès",
    text:
      "Une mesure préparatoire peut faire partie du parcours d’études lorsqu’elle est réellement liée à un projet universitaire. Pour la Tunisie, l’Ambassade demande notamment une base académique et des preuves précises pour le cours préparatoire.",
    action: "Voir les exigences à Tunis",
    href: "https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573166-2573166",
    tone: "accent",
  },
  {
    eyebrow: "Pas encore de place",
    title: "Vous cherchez encore une place d’études",
    text:
      "Si vous n’avez pas encore d’admission mais remplissez les conditions applicables, il existe une voie de recherche d’une place dans l’enseignement supérieur au titre du §17(2). Ce n’est pas une admission automatique.",
    action: "Voir la recherche de place",
    href: "https://www.make-it-in-germany.com/en/visa-residence/types/studying",
    tone: "neutral",
  },
  {
    eyebrow: "Cours de langue isolé",
    title: "Votre objectif principal est uniquement d’apprendre l’allemand",
    text:
      "Un cours de langue isolé relève d’une autre logique, notamment du §16f. Il ne faut pas le confondre avec un cours de langue directement intégré à une préparation aux études.",
    action: "Voir le visa cours de langue",
    href: "https://www.make-it-in-germany.com/en/visa-residence/types/other/language-acquisition",
    tone: "neutral",
  },
] as const;

const tunisChecks = [
  {
    title: "Base académique",
    text:
      "Admission conditionnelle d’une université allemande, Bewerberbestätigung ou correspondance équivalente avec la faculté.",
  },
  {
    title: "Cours préparatoire",
    text:
      "Inscription à un cours d’allemand en Allemagne destiné aux candidats aux études universitaires, avec au moins 20 heures par semaine.",
  },
  {
    title: "Niveau d’allemand",
    text:
      "Au moins A2, attesté par une institution acceptée selon les critères ALTE indiqués par l’Ambassade.",
  },
  {
    title: "Financement et assurance",
    text:
      "Les preuves demandées doivent être préparées selon les montants, formats et conditions publiés au moment de la demande sur la source officielle.",
  },
] as const;

export default function GermanyStudyPathPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <PublicBreadcrumbs items={[{ label: "Parcours Allemagne" }]} />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Parcours Allemagne
          </p>
          <h1 className="mt-4 max-w-5xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Commencez par la solution académique. Le visa vient ensuite.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Bachelor, Master, préparation linguistique ou recherche d’une place : le bon ordre est de
            clarifier votre projet, vérifier votre accès, identifier la procédure de candidature puis
            choisir la voie de séjour adaptée à la situation réellement obtenue.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-light)]">
                À retenir
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Une admission universitaire ne garantit jamais l’obtention d’un visa. L’université
                décide de l’admission ; les autorités compétentes décident du séjour.
              </p>
            </div>
            <div className="rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-light)]">
                Méthode AlmaGo
              </p>
              <p className="mt-2 text-sm leading-6 text-indigo-100">
                Nous séparons toujours la partie académique, la candidature et la partie visa pour
                éviter de commencer avec une mauvaise procédure.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="academic-first-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">D’abord : votre solution académique</p>
            <h2 id="academic-first-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Quatre étapes avant de parler de visa.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Le visa dépend de la situation académique que vous avez réellement obtenue. Commencez
              donc par construire le dossier dans cet ordre.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {academicSteps.map((step) => (
              <article
                key={step.number}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-slate-950">{step.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/selon-votre-pays"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Vérifier selon mon parcours
            </Link>
            <Link
              href="/comprendre-les-demarches"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-slate-800 transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Comprendre VPD, HZB, Studienkolleg…
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="routes-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Ensuite : la bonne voie de séjour</p>
            <h2 id="routes-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              La réponse dépend de votre situation académique.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Ne choisissez pas une catégorie de visa parce qu’elle semble plus simple. Vérifiez
              d’abord laquelle correspond au but réel de votre séjour et aux documents que vous possédez.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {routes.map((route) => (
              <article
                key={route.title}
                className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-6 sm:p-7"
              >
                <span
                  className={
                    route.tone === "accent"
                      ? "w-fit rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900"
                      : route.tone === "brand"
                        ? "w-fit rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]"
                        : "w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                  }
                >
                  {route.eyebrow}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-950">{route.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{route.text}</p>
                <a
                  href={route.href}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                >
                  {route.action}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-18" aria-labelledby="tunisia-prep-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="eyebrow">Depuis la Tunisie</p>
              <h2 id="tunisia-prep-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Préparation aux études : ce que l’Ambassade demande actuellement.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Cette section concerne la procédure publiée par l’Ambassade d’Allemagne à Tunis pour
                une préparation aux études. Les conditions peuvent évoluer : vérifiez la page officielle
                avant chaque demande.
              </p>
              <a
                href="https://tunis.diplo.de/tn-fr/service/05-visaeinreise/2573166-2573166"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
              >
                Ouvrir la checklist officielle de Tunis
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {tunisChecks.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
                >
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-[var(--radius-panel)] border border-amber-200 bg-amber-50/60 p-5 sm:p-6">
            <p className="text-sm font-bold text-amber-950">Cours de langue ≠ toujours même visa</p>
            <p className="mt-2 text-sm leading-6 text-amber-900">
              Un cours d’allemand directement lié à une préparation aux études n’est pas la même situation
              qu’un séjour dont le but principal est uniquement l’apprentissage de la langue. Identifiez le
              but réel du séjour avant de préparer la demande.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16" aria-labelledby="official-path-sources-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Sources à garder ouvertes</p>
            <h2 id="official-path-sources-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Vérifiez chaque étape au bon endroit.
            </h2>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SourceLink
              title="Ambassade d’Allemagne à Tunis"
              text="Visas nationaux et préparation aux études pour les demandes déposées depuis la Tunisie."
              href="https://tunis.diplo.de/tn-fr/service/05-visaeinreise/1672716-1672716"
            />
            <SourceLink
              title="Portail fédéral Make it in Germany"
              text="Cadre général des visas pour études, préparation et recherche d’une place."
              href="https://www.make-it-in-germany.com/en/visa-residence/types/studying"
            />
            <SourceLink
              title="uni-assist"
              text="Procédures de candidature, VPD, documents et informations selon le pays."
              href="https://www.uni-assist.de/en/how-to-apply/plan-your-application/"
            />
            <SourceLink
              title="DAAD"
              text="Première orientation sur l’accès aux études et les exigences pour étudiants internationaux."
              href="https://www.daad.de/en/studying-in-germany/requirements/"
            />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/sources-officielles"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-5 text-sm font-bold text-slate-800 transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Voir toutes les sources officielles
            </Link>
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Créer mon dossier AlmaGo
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}

function SourceLink({
  title,
  text,
  href,
}: Readonly<{
  title: string;
  text: string;
  href: string;
}>) {
  return (
    <article className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{text}</p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
      >
        Consulter la source
      </a>
    </article>
  );
}
