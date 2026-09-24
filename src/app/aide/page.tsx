import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";

export const metadata: Metadata = {
  title: "Centre d’aide | AlmaGo",
  description:
    "Retrouvez rapidement les informations utiles pour préparer votre dossier, comprendre les démarches et suivre votre projet d’études en Allemagne.",
};

const quickLinks = [
  {
    title: "Commencer mon dossier",
    text: "Créez votre espace AlmaGo et commencez par les informations essentielles de votre projet.",
    href: "/signup",
    action: "Créer mon dossier",
  },
  {
    title: "Comprendre les démarches",
    text: "VPD, NC, Studienkolleg, TestAS, uni-assist… retrouvez des explications simples et sourcées.",
    href: "/comprendre-les-demarches",
    action: "Voir les explications",
  },
  {
    title: "Selon votre pays de diplôme",
    text: "Identifiez les vérifications utiles selon votre parcours scolaire et les documents que vous utilisez.",
    href: "/selon-votre-pays",
    action: "Vérifier par parcours",
  },
  {
    title: "Suivre mon dossier",
    text: "Retrouvez vos documents, vos démarches, vos pistes d’orientation et vos candidatures.",
    href: "/login",
    action: "Me connecter",
  },
] as const;

const questions = [
  {
    category: "Dossier et documents",
    items: [
      {
        q: "Par quoi commencer ?",
        a: "Commencez par votre profil, puis ajoutez les informations et documents réellement disponibles. Votre espace met en évidence les prochaines étapes enregistrées dans votre dossier.",
      },
      {
        q: "Comment savoir si un document doit être traduit ?",
        a: "Cela dépend du document, de sa langue et de la procédure utilisée. Consultez les exigences de l’université et, lorsqu’elle traite votre candidature, les règles publiées par uni-assist.",
      },
      {
        q: "Que signifie un document “à remplacer” ?",
        a: "Cela signifie qu’une nouvelle version est demandée dans AlmaGo. Consultez le commentaire associé avant de déposer un autre fichier.",
      },
    ],
  },
  {
    category: "Orientation et programmes",
    items: [
      {
        q: "Une piste d’orientation garantit-elle mon admission ?",
        a: "Non. Une piste d’orientation vous aide à examiner un programme. L’éligibilité et l’admission sont décidées selon les règles de l’université ou de l’organisme compétent.",
      },
      {
        q: "Comment comparer plusieurs programmes ?",
        a: "Dans votre espace orientation, vous pouvez sélectionner jusqu’à trois pistes et comparer les informations enregistrées : établissement, langue, échéances, diplôme demandé et source officielle.",
      },
      {
        q: "Quelle information dois-je vérifier en priorité ?",
        a: "Vérifiez toujours la source officielle pour les conditions d’admission, les niveaux de langue, la procédure de candidature et les dates limites.",
      },
    ],
  },
  {
    category: "Candidatures et échéances",
    items: [
      {
        q: "Le statut AlmaGo est-il le statut officiel de l’université ?",
        a: "Non. Il décrit le suivi enregistré dans votre dossier AlmaGo. La décision et le statut officiels restent ceux communiqués par l’université ou l’organisme concerné.",
      },
      {
        q: "Que faire si une échéance approche ?",
        a: "Ouvrez la candidature concernée, vérifiez la prochaine action enregistrée puis contrôlez la date sur la source officielle avant d’envoyer un dossier.",
      },
      {
        q: "Pourquoi certaines dates peuvent-elles changer ?",
        a: "Les universités peuvent fixer des calendriers différents selon le programme, le semestre et le type de candidature. Une ancienne date ne doit pas être utilisée comme règle pour un nouveau semestre.",
      },
    ],
  },
  {
    category: "Compte et confidentialité",
    items: [
      {
        q: "Où retrouver les informations de mon dossier ?",
        a: "Après connexion, votre espace étudiant réunit votre profil, vos documents, vos démarches, votre orientation et vos candidatures.",
      },
      {
        q: "AlmaGo publie-t-il mes documents ?",
        a: "Les documents du dossier étudiant appartiennent à l’espace privé. Les informations publiques du site ne doivent pas exposer le contenu de vos fichiers personnels.",
      },
      {
        q: "Qui prend les décisions officielles ?",
        a: "Les universités, autorités et organismes compétents prennent leurs propres décisions. AlmaGo organise le dossier et le suivi sans se substituer à eux.",
      },
    ],
  },
] as const;

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Centre d’aide
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Trouvez rapidement la bonne prochaine étape.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Une question sur votre dossier, un programme ou une démarche ? Commencez par le sujet qui vous concerne.
            Les informations officielles restent toujours à vérifier auprès de l’organisme compétent.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="help-start-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Accès rapide</p>
            <h2 id="help-start-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Que souhaitez-vous faire ?
            </h2>
          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
              >
                <h3 className="text-lg font-bold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{item.text}</p>
                <Link
                  href={item.href}
                  className="mt-5 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                >
                  {item.action}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-18" aria-labelledby="help-questions-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Questions fréquentes</p>
            <h2 id="help-questions-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Des réponses simples aux questions les plus courantes.
            </h2>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {questions.map((group) => (
              <section
                key={group.category}
                aria-labelledby={`help-${group.category.replace(/\s+/g, "-").toLowerCase()}`}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#fbfaf8] p-5 sm:p-6"
              >
                <h3
                  id={`help-${group.category.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-xl font-bold tracking-tight text-slate-950"
                >
                  {group.category}
                </h3>
                <div className="mt-4 divide-y divide-[var(--border)]">
                  {group.items.map((item) => (
                    <details key={item.q} className="group">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]">
                        <span>{item.q}</span>
                        <span
                          aria-hidden="true"
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] transition-transform group-open:rotate-45"
                        >
                          +
                        </span>
                      </summary>
                      <p className="pb-4 pr-10 text-sm leading-6 text-slate-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                Vous avez déjà un dossier ?
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                Retrouvez d’abord le contexte dans votre espace.
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
                Vos statuts, commentaires, prochaines étapes et échéances sont liés à votre dossier personnel.
                Consultez-les avant de vérifier une information auprès de l’université ou de l’organisme concerné.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-5 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Accéder à mon dossier
            </Link>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}
