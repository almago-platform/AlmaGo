import Link from "next/link";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/98 backdrop-blur">
      <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11px] font-semibold text-slate-600 sm:px-6 lg:px-8">
          <p className="truncate">
            Accompagnement indépendant · Les décisions officielles restent celles des organismes compétents
          </p>
          <a href="#confiance" className="hidden shrink-0 text-[var(--brand)] hover:underline hover:underline-offset-4 sm:inline">
            Notre cadre de confiance
          </a>
        </div>
      </div>

      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AlmaGo accueil">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">
            A
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold leading-5 tracking-[-0.02em] text-slate-950">AlmaGo</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:block">
              Études en Allemagne
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex" aria-label="Navigation principale">
          <a className="hover:text-[var(--brand)]" href="#parcours">Parcours</a>
          <a className="hover:text-[var(--brand)]" href="#espace">Espace étudiant</a>
          <a className="hover:text-[var(--brand)]" href="#confiance">Confiance & sources</a>
          <a className="hover:text-[var(--brand)]" href="#faq">FAQ</a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-10 items-center justify-center rounded-[var(--radius-control)] px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[var(--brand)] sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
          >
            Créer mon dossier
          </Link>
        </div>
      </div>
    </header>
  );
}
