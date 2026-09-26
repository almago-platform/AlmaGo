import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden overflow-hidden rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-white shadow-none lg:block">
          <div className="border-b border-[var(--border)] bg-[var(--surface-subtle)] p-7">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">
                A
              </span>
              <span>
                <span className="block text-base font-bold tracking-tight text-slate-950">AlmaGo</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                  Sécurité du compte
                </span>
              </span>
            </Link>
          </div>

          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Réinitialisation</p>
            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950">
              Choisissez un nouveau mot de passe pour retrouver votre espace.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Cette étape sécurise l&apos;accès à votre dossier étudiant. Après validation, vous serez redirigé vers votre tableau de bord.
            </p>

            <div className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">01</span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Conseil sécurité</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Utilisez au moins 8 caractères et évitez un mot de passe déjà utilisé.</p>
                </div>
              </div>
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">02</span>
                <div>
                  <p className="text-sm font-bold text-slate-950">Accès au dossier</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Le changement concerne seulement votre compte, pas les données enregistrées dans votre dossier.</p>
                </div>
              </div>
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
