import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeHero } from "@/components/public/HomeHero";
import { HomeValueSection } from "@/components/public/HomeValueSection";
import { HomeJourneySection } from "@/components/public/HomeJourneySection";


export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />
      <HomeHero />
      <HomeValueSection />

      <HomeJourneySection />

      <section id="espace" className="border-y border-[var(--border)] bg-[var(--surface-muted)] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="eyebrow">Votre espace AlmaGo</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950">
              Vous voyez le dossier, pas seulement une liste de fichiers.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Les pages étudiant sont organisées autour d’une question simple : où en est le dossier et quelle action est utile maintenant ?
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Feature title="Mon dossier" description="Une synthèse des éléments enregistrés et de la priorité actuelle." />
            <Feature title="Mes documents" description="Les fichiers envoyés, leur statut et les messages de correction visibles." />
            <Feature title="Mon orientation" description="Les recommandations publiées, leurs critères et les programmes qui vous intéressent." />
            <Feature title="Mes candidatures" description="Les statuts, échéances, prochaines actions et historiques visibles." />
          </div>
        </div>
      </section>

      <section id="confiance" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="rounded-[var(--radius-panel)] bg-[var(--brand)] p-6 text-white sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-light)]">Transparence</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
                Des états lisibles plutôt que des promesses artificielles.
              </h2>
              <p className="mt-4 text-sm leading-7 text-indigo-100 sm:text-base">
                AlmaGo organise et rend visibles les informations de votre dossier. La plateforme ne transforme pas une progression, une recommandation ou un statut interne en garantie d’admission.
              </p>
              <div className="mt-6 rounded-[var(--radius-control)] border border-white/15 bg-white/10 p-4">
                <p className="text-sm font-semibold">À vérifier avec la source officielle</p>
                <p className="mt-1 text-sm leading-6 text-indigo-100">
                  Lorsqu’un lien officiel est enregistré pour un programme, vous pouvez l’ouvrir depuis votre orientation afin de vérifier les informations auprès de l’établissement.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TrustItem
                title="Une recommandation"
                description="C’est une piste de travail publiée dans votre dossier. Elle ne signifie pas que l’université vous acceptera."
              />
              <TrustItem
                title="La progression du dossier"
                description="Elle aide à suivre les éléments préparés. Elle n’est pas une probabilité d’admission ni une décision d’une autorité."
              />
              <TrustItem
                title="Le statut d’un document"
                description="Il décrit l’état de vérification dans AlmaGo, par exemple reçu, vérifié ou à remplacer. Il ne remplace pas la validation d’un organisme externe."
              />
              <TrustItem
                title="Le suivi d’une candidature"
                description="Il reprend le statut, l’échéance et la prochaine action enregistrés. La décision finale appartient à l’établissement concerné."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-white py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Prêt à commencer ?</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Créez votre espace et commencez par votre profil.</h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Créer mon dossier
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-6 font-bold text-slate-900 transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Connexion
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrustItem({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-muted)] p-5">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-700">{description}</p>
    </article>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <article className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 shadow-sm">
      <h3 className="font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
