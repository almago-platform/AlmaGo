import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-white">
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[43%] bg-[#f4f1ec] lg:block" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(24rem,0.98fr)] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 border-l-2 border-[var(--accent)] pl-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Votre projet d’études en Allemagne
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.65rem]">
            Vous avancez étape par étape. AlmaGo garde le fil.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            AlmaGo vous aide à transformer un projet complexe en un dossier compréhensible : objectif académique, documents, programmes, candidatures et prochaines démarches restent organisés dans un même parcours.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 text-base font-bold text-white hover:bg-[var(--brand-strong)]"
            >
              Préparer mon dossier
            </Link>
            <a
              href="#parcours"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border-strong)] bg-white px-6 text-base font-bold text-slate-800 hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Comprendre le parcours
            </a>
          </div>

          <div className="mt-9 grid max-w-2xl gap-4 border-t border-[var(--border)] pt-5 text-sm text-slate-600 sm:grid-cols-3">
            <TrustFact title="Vous savez où vous en êtes" text="Les statuts distinguent ce qui est à faire, suivi ou terminé." />
            <TrustFact title="Vous voyez les sources" text="Les informations vérifiées conservent leur provenance." />
            <TrustFact title="Les rôles restent clairs" text="AlmaGo n’accorde ni admission ni visa." />
          </div>
        </div>

        <figure className="relative lg:pl-5">
          <div className="relative overflow-hidden rounded-[calc(var(--radius-panel)+0.45rem)] border border-[#d9d3ca] bg-slate-100 shadow-[var(--shadow-soft)]">
            <Image
              src="https://images.unsplash.com/photo-1759852692971-a2abc6799cbd?auto=format&fit=crop&w=1400&q=82"
              alt="Étudiante souriante sur un campus, avec des cahiers et un sac à dos."
              width={1400}
              height={1700}
              priority
              className="h-[31rem] w-full object-cover object-center sm:h-[36rem] lg:h-[39rem]"
              sizes="(min-width: 1024px) 43vw, 100vw"
            />

            <div className="absolute left-4 top-4 rounded-[var(--radius-control)] border border-white/70 bg-white/92 px-3 py-2 text-xs font-bold text-[var(--brand)] shadow-sm backdrop-blur">
              Un parcours structuré, sans avancer seul
            </div>

            <div className="absolute inset-x-4 bottom-4 rounded-[var(--radius-panel)] border border-white/70 bg-white/94 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--accent-strong)]">Votre repère AlmaGo</p>
              <h2 className="mt-2 text-xl font-bold tracking-[-0.02em] text-slate-950">Toujours une prochaine étape visible.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Projet, documents, orientation et candidatures restent reliés pour que vous puissiez reprendre votre dossier sans repartir de zéro.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold text-slate-600">
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[var(--brand)]">Projet</span>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[var(--brand)]">Documents</span>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-1 text-[var(--brand)]">Candidatures</span>
              </div>
            </div>
          </div>
          <figcaption className="mt-2 text-right text-[10px] text-slate-400">
            Photo : Oluwaseyi Akinlolu / Unsplash
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function TrustFact({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="font-bold text-slate-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
