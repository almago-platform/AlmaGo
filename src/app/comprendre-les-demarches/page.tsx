import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";
import { PublicBreadcrumbs } from "@/components/public/PublicBreadcrumbs";

export const metadata: Metadata = {
  title: "Comprendre les démarches | AlmaGo",
  description:
    "Des explications simples sur les principales démarches pour préparer un projet d’études en Allemagne.",
};

const topics = [
  {
    id: "vpd",
    term: "VPD",
    title: "Vorprüfungsdokumentation",
    meaning:
      "Une VPD est un document préparé par uni-assist pour certaines universités. Elle reprend les certificats examinés, leur évaluation et la conversion de la note dans le système allemand.",
    when:
      "Vous pouvez la rencontrer lorsqu’une université demande d’abord une évaluation par uni-assist, puis une candidature directe auprès de l’université.",
    action:
      "Vérifiez toujours si votre université exige une VPD et demandez-la suffisamment tôt pour pouvoir ensuite respecter la date limite de l’université.",
    source: "uni-assist",
    sourceUrl: "https://www.uni-assist.de/en/how-to-apply/plan-your-application/vpd/",
  },
  {
    id: "nc",
    term: "NC",
    title: "Numerus Clausus",
    meaning:
      "Le NC indique qu’un programme dispose d’un nombre limité de places. Pour certains programmes, la valeur utilisée lors d’un semestre dépend du nombre et du niveau des candidatures reçues.",
    when:
      "Vous le verrez surtout sur des programmes à admission restreinte.",
    action:
      "Ne considérez pas automatiquement une valeur NC d’un ancien semestre comme une limite garantie pour le semestre suivant. Vérifiez les règles actuelles auprès de l’établissement.",
    source: "Hochschulkompass",
    sourceUrl:
      "https://www.hochschulkompass.de/studium/bewerbung-zulassung/zulassungsverfahren/oertliche-zulassungsbeschraenkung.html",
  },
  {
    id: "hzb",
    term: "HZB",
    title: "Hochschulzugangsberechtigung",
    meaning:
      "La HZB désigne la qualification qui permet d’accéder à l’enseignement supérieur en Allemagne. Un diplôme scolaire étranger peut donner un accès direct, un accès sous certaines conditions ou nécessiter une préparation supplémentaire.",
    when:
      "Cette question apparaît très tôt lorsqu’une université examine si votre parcours scolaire permet une entrée directe dans le type d’études choisi.",
    action:
      "Utilisez les bases officielles d’admission comme première orientation, puis vérifiez votre situation avec l’université ou le service qui traite votre candidature.",
    source: "DAAD",
    sourceUrl:
      "https://www.daad.de/en/studying-in-germany/requirements/studienkollegs/",
  },
  {
    id: "studienkolleg",
    term: "Studienkolleg",
    title: "Année préparatoire",
    meaning:
      "Un Studienkolleg prépare certains étudiants internationaux lorsque leur qualification scolaire ne permet pas encore un accès direct aux études supérieures en Allemagne.",
    when:
      "Il peut être nécessaire selon le pays du diplôme, le parcours scolaire ou universitaire déjà effectué et le domaine d’études visé.",
    action:
      "Ne supposez pas qu’un Studienkolleg est nécessaire uniquement à partir de votre nationalité. C’est votre formation antérieure et la règle applicable au programme qui comptent.",
    source: "DAAD",
    sourceUrl:
      "https://www.daad.de/en/studying-in-germany/requirements/studienkollegs/",
  },
  {
    id: "testas",
    term: "TestAS",
    title: "Test d’aptitude aux études",
    meaning:
      "Le TestAS est un test destiné aux candidats internationaux. Il mesure des aptitudes générales et liées au domaine d’études et peut être utilisé par certaines universités dans leur procédure d’admission ou de sélection.",
    when:
      "Selon l’établissement et le programme, le résultat peut être demandé, pris en compte comme critère supplémentaire ou ne pas être nécessaire.",
    action:
      "Vérifiez la page officielle du programme avant de vous inscrire à un test uniquement parce que vous avez vu le mot TestAS ailleurs.",
    source: "TestAS",
    sourceUrl: "https://www.testas.de/en/",
  },
  {
    id: "uni-assist",
    term: "uni-assist",
    title: "Évaluation de candidatures internationales",
    meaning:
      "uni-assist traite les candidatures ou les évaluations préalables pour certaines universités allemandes. Le rôle exact dépend de l’université et de la procédure utilisée.",
    when:
      "Vous pouvez devoir déposer votre candidature dans My assist, demander une VPD ou suivre une procédure combinée avec l’université.",
    action:
      "Vérifiez d’abord quelle procédure votre université demande. Même lorsque uni-assist évalue le dossier, la décision d’admission revient à l’université.",
    source: "uni-assist",
    sourceUrl: "https://www.uni-assist.de/en/how-to-apply/plan-your-application/",
  },
  {
    id: "dosv",
    term: "DoSV",
    title: "Dialogorientiertes Serviceverfahren",
    meaning:
      "Le DoSV est une procédure coordonnée via hochschulstart.de pour certains programmes de premier cycle à admission locale restreinte.",
    when:
      "Lorsque votre programme participe au DoSV, une inscription supplémentaire sur hochschulstart.de peut être nécessaire en plus de la candidature auprès de l’université ou de uni-assist.",
    action:
      "Suivez exactement les indications du programme concerné. Ne créez pas une procédure DoSV supplémentaire si l’université ne la demande pas.",
    source: "uni-assist",
    sourceUrl: "https://www.uni-assist.de/en/how-to-apply/plan-your-application/",
  },
  {
    id: "translations",
    term: "Traductions",
    title: "Documents traduits et officiels",
    meaning:
      "Les documents scolaires ou universitaires qui ne sont pas délivrés en allemand ou en anglais peuvent devoir être accompagnés d’une traduction conforme aux exigences du service qui traite la candidature.",
    when:
      "Cette question concerne souvent les diplômes, relevés de notes et autres justificatifs académiques.",
    action:
      "Vérifiez qui est autorisé à traduire vos documents et si votre procédure exige uniquement un dépôt numérique ou aussi des copies officiellement certifiées.",
    source: "uni-assist",
    sourceUrl:
      "https://www.uni-assist.de/en/how-to-apply/assemble-your-documents/translations/",
  },
] as const;

export default function UnderstandProcessPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <PublicBreadcrumbs items={[{ label: "Comprendre les démarches" }]} />

      <section className="border-b border-[var(--border)] bg-[var(--brand)] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">
            Comprendre les démarches
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
            Les mots importants, expliqués simplement.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-indigo-100 sm:text-lg">
            Certaines démarches allemandes utilisent des termes difficiles à comprendre au premier regard.
            AlmaGo vous explique ici leur rôle, quand ils peuvent vous concerner et ce que vous devez vérifier ensuite.
          </p>
          <div className="mt-7 rounded-[var(--radius-panel)] border border-white/15 bg-white/10 p-5 text-sm leading-6 text-indigo-100">
            Ces explications sont générales. Votre université et les organismes officiels restent la référence pour savoir quelle règle s’applique réellement à votre dossier.
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf8] py-12 sm:py-16" aria-labelledby="topics-title">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="eyebrow">Repères essentiels</p>
            <h2 id="topics-title" className="mt-3 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Ce que ces termes signifient pour votre projet.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Chaque fiche distingue l’explication générale de l’action concrète à vérifier pour votre situation.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            {topics.map((topic) => (
              <article
                key={topic.id}
                id={topic.id}
                className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                      {topic.term}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{topic.title}</h3>
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">
                    À connaître
                  </span>
                </div>

                <div className="mt-5 space-y-4 text-sm leading-6">
                  <GuideBlock title="Ce que cela signifie">{topic.meaning}</GuideBlock>
                  <GuideBlock title="Quand vous pouvez le rencontrer">{topic.when}</GuideBlock>
                  <GuideBlock title="Ce que vous devez vérifier">{topic.action}</GuideBlock>
                </div>

                <div className="mt-6 border-t border-[var(--border)] pt-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Source officielle
                  </p>
                  <a
                    href={topic.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center font-bold text-[var(--brand)] underline decoration-[var(--brand-border)] underline-offset-4 hover:text-[var(--brand-hover)]"
                  >
                    Consulter {topic.source}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/50 p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Le bon réflexe</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">
              Comprendre d’abord, vérifier ensuite.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
              Une explication AlmaGo doit vous aider à savoir quoi chercher. Pour une date limite, un niveau de langue, une condition d’admission ou une procédure précise, consultez ensuite la page officielle du programme ou de l’organisme concerné.
            </p>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}

function GuideBlock({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-slate-600">{children}</p>
    </div>
  );
}
