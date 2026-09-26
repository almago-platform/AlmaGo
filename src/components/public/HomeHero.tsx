import Image from "next/image";
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-strong)] text-white">
      <div className="mx-auto grid min-h-[36rem] max-w-[96rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(36rem,1.08fr)]">
        <div className="relative z-10 flex items-center px-4 py-12 sm:px-8 sm:py-14 lg:px-12 xl:px-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border-l-2 border-[var(--accent)] pl-3 text-xs font-bold uppercase tracking-[0.18em] text-white/75">
              Projet d’études en Allemagne
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl lg:text-[3.6rem] xl:text-[4rem]">
              Votre projet, structuré dès le premier pas.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              AlmaGo rassemble votre projet, vos documents, vos programmes et vos candidatures dans un parcours lisible — avec une prochaine action claire et les sources importantes visibles.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-white px-6 text-base font-bold text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]"
              >
                Créer mon dossier
              </Link>
              <a
                href="#espace"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-white/35 bg-white/5 px-6 text-base font-bold text-white hover:bg-white/10"
              >
                Voir AlmaGo en pratique
              </a>
            </div>

            <div className="mt-8 grid gap-3 border-t border-white/15 pt-5 sm:grid-cols-3">
              <HeroFact value="01" label="Dossier relié" detail="Projet, pièces, candidatures" />
              <HeroFact value="02" label="Action visible" detail="Ce qui compte maintenant" />
              <HeroFact value="03" label="Sources claires" detail="Provenance et limites" />
            </div>
          </div>
        </div>

        <div className="relative min-h-[27rem] lg:min-h-full">
          <Image
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=88"
            alt="Groupe d’étudiants échangeant ensemble sur un campus universitaire."
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[var(--brand-strong)]/35 via-transparent to-transparent lg:from-[var(--brand-strong)]/20" />

          <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 lg:left-8 lg:right-auto lg:w-[28rem]">
            <div className="border border-white/70 bg-white/94 p-5 text-slate-950 shadow-[0_18px_60px_rgba(8,28,45,0.22)] backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Votre repère AlmaGo</p>
              <p className="mt-2 text-xl font-bold tracking-[-0.02em]">Toujours savoir ce qui vient ensuite.</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Le dossier distingue ce qui est prêt, ce qui manque et ce qui dépend encore d’un organisme externe.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold">
                <span className="bg-[var(--brand-soft)] px-2.5 py-1.5 text-[var(--brand)]">Projet</span>
                <span className="bg-[var(--brand-soft)] px-2.5 py-1.5 text-[var(--brand)]">Documents</span>
                <span className="bg-[var(--brand-soft)] px-2.5 py-1.5 text-[var(--brand)]">Candidatures</span>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-4 rounded-full border border-white/55 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-[var(--brand-strong)] shadow-sm sm:right-6 sm:top-6">
            Accompagnement indépendant
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroFact({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <div className="grid grid-cols-[2rem_1fr] gap-2">
      <span className="text-xs font-bold text-[var(--accent)]">{value}</span>
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-white/55">{detail}</p>
      </div>
    </div>
  );
}
