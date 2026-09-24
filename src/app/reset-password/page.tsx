import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm lg:block">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand)] text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight">AlmaGo</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Sécurité du compte
              </span>
            </span>
          </Link>

          <div className="mt-12">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Réinitialisation</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
              Choisissez un nouveau mot de passe pour retrouver votre espace.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Cette étape sécurise l&apos;accès à votre compte. Après validation, vous serez redirigé vers votre espace AlmaGo.
            </p>
          </div>

          <div className="mt-10 grid gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Conseil sécurité</p>
              <p className="mt-1 font-bold text-slate-950">Utilisez au moins 8 caractères et évitez un mot de passe déjà utilisé.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold text-slate-500">Accès dossier</p>
              <p className="mt-1 font-bold text-slate-950">Le changement concerne uniquement votre compte, pas les données de votre dossier.</p>
            </div>
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
          <ResetPasswordForm />
        </section>
      </div>
    </main>
  );
}
