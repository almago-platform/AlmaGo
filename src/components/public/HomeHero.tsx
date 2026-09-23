import Image from "next/image";
import Link from "next/link";

const trustPoints = [
  "Dossier centralisé",
  "Étapes lisibles",
  "Suivi transparent",
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand)] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.08),transparent_18rem),linear-gradient(115deg,rgba(32,38,111,0.18),transparent_48%)]" />
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-[55%] opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto grid min-h-[39rem] w-full max-w-[96rem] lg:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)]">
        <div className="z-10 flex items-center px-4 py-14 sm:px-6 sm:py-18 lg:px-10 lg:py-20 xl:pl-[max(2rem,calc((100vw-80rem)/2))] xl:pr-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Votre projet d’études en Allemagne, mieux organisé
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-[3.65rem] xl:text-[4.15rem]">
              Préparez votre dossier d’études en Allemagne avec une vue claire sur chaque étape.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg sm:leading-8">
              AlmaGo rassemble votre profil, vos documents, votre orientation, vos démarches et vos candidatures dans un espace structuré pour savoir ce qui est prêt, ce qui reste à vérifier et quelle action faire ensuite.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-white px-6 text-base font-bold text-[var(--brand)] shadow-[0_18px_36px_-24px_rgba(0,0,0,0.75)] transition-all duration-150 hover:-translate-y-px hover:bg-slate-50"
              >
                Créer mon dossier
              </Link>
              <a
                href="#parcours"
                className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-white/30 bg-white/5 px-6 text-base font-bold text-white transition-colors hover:bg-white/10"
              >
                Voir comment ça marche
              </a>
            </div>

            <ul className="mt-8 grid gap-3 text-sm font-semibold text-white/90 sm:grid-cols-3">
              {trustPoints.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <span aria-hidden="true" className="grid h-6 w-6 place-items-center rounded-full bg-white/12 text-[var(--accent-light)]">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative min-h-[31rem] overflow-hidden lg:min-h-[39rem]">
          <Image
            src="https://images.unsplash.com/photo-1759852692971-a2abc6799cbd?auto=format&fit=crop&q=88&w=1800"
            alt="Étudiant souriant avec sac et livres sur un campus"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 54vw"
            className="object-cover object-center"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[var(--brand)] via-[rgba(41,48,139,0.22)] to-transparent lg:from-[var(--brand)] lg:via-[rgba(41,48,139,0.08)] lg:to-transparent" />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950/55 to-transparent" />

          <div className="absolute inset-x-4 bottom-5 sm:inset-x-6 lg:bottom-8 lg:left-auto lg:right-8 lg:w-[26rem]">
            <div className="rounded-[var(--radius-panel)] border border-white/70 bg-white/94 p-5 text-slate-950 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.8)] backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Un seul espace</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight">Votre projet reste lisible du début à la candidature.</h2>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <HeroMiniItem label="Profil" />
                <HeroMiniItem label="Documents" />
                <HeroMiniItem label="Orientation" />
                <HeroMiniItem label="Candidatures" />
              </div>
            </div>
          </div>

          <a
            href="https://unsplash.com/photos/a-smiling-student-with-backpack-and-books-walks-outside-dPQBwZ6d-NU"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-2 right-3 text-[10px] font-medium text-white/75 underline decoration-white/30 underline-offset-2 hover:text-white"
          >
            Photo : Oluwaseyi Akinlolu / Unsplash
          </a>
        </div>
      </div>
    </section>
  );
}

function HeroMiniItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--surface-muted)] px-3 py-2.5 font-semibold text-slate-700">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
      {label}
    </div>
  );
}
