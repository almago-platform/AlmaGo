import Link from "next/link";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 shadow-[0_10px_30px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
      <div className="mx-auto flex min-h-18 w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="AlmaGo accueil">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-base font-bold text-white shadow-[0_10px_24px_-16px_rgba(41,48,139,0.95)]">
            A
            <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-bold leading-5 tracking-tight text-slate-950">AlmaGo</span>
            <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:block">
              Études en Allemagne
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex" aria-label="Navigation principale">
          <a className="transition-colors hover:text-[var(--brand)]" href="#parcours">Comment ça marche</a>
          <a className="transition-colors hover:text-[var(--brand)]" href="#role">Notre rôle</a>
          <a className="transition-colors hover:text-[var(--brand)]" href="#espace">Votre espace</a>
          <a className="transition-colors hover:text-[var(--brand)]" href="#confiance">Confiance</a>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center justify-center rounded-[var(--radius-control)] px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-[var(--brand)] sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            href="/signup"
            className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-4 text-sm font-bold text-white shadow-[0_10px_24px_-16px_rgba(41,48,139,0.95)] transition-all duration-150 hover:-translate-y-px hover:bg-[var(--brand-strong)]"
          >
            Créer mon dossier
          </Link>
        </div>
      </div>
    </header>
  );
}
