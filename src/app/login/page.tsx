import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-[var(--shadow-card)] lg:block">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">AlmaGo</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Espace étudiant
              </span>
            </span>
          </Link>

          <div className="mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Accès dossier</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Reprends ton parcours Allemagne là où tu t&apos;es arrêté.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Connecte-toi pour suivre ton profil, tes documents, tes recommandations et tes prochaines actions dans un espace unique.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
              <p className="text-sm font-semibold text-slate-600">Suivi clair</p>
              <p className="mt-1 font-bold text-slate-950">Chaque étape reliée à une action concrète.</p>
            </div>
            <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-muted)]/50 p-4">
              <p className="text-sm font-semibold text-slate-600">Dossier centralisé</p>
              <p className="mt-1 font-bold text-slate-950">Profil, documents et candidatures au même endroit.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-sm font-bold text-[var(--brand)]">
              AlmaGo
            </Link>
            <Link href="/signup" className="text-sm font-semibold text-slate-600">
              Créer un compte
            </Link>
          </div>
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
