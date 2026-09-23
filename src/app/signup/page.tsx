import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
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
                Nouveau dossier
              </span>
            </span>
          </Link>

          <div className="mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Commencer proprement</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Crée ton espace étudiant et avance étape par étape.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              AlmaGo t&apos;aide à structurer ton dossier Allemagne dès le départ : profil, documents, orientation et candidatures.
            </p>
          </div>

          <div className="mt-10 rounded-[var(--radius-panel)] bg-[var(--brand)] p-5 text-white">
            <p className="text-sm font-semibold text-[var(--accent-light)]">Après inscription</p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-200">
              <li>1. Confirme ton email.</li>
              <li>2. Complète ton profil étudiant.</li>
              <li>3. Ajoute les documents demandés.</li>
            </ol>
          </div>
        </section>

        <section className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="text-sm font-bold text-[var(--brand)]">
              AlmaGo
            </Link>
            <Link href="/login" className="text-sm font-semibold text-slate-600">
              Connexion
            </Link>
          </div>
          <AuthForm initialMode="signup" />
        </section>
      </div>
    </main>
  );
}
