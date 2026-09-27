import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_48%,#f1ece4_100%)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <section className="hidden min-h-[620px] overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_28px_70px_-52px_rgba(28,33,36,0.55)] lg:flex lg:flex-col">
          <div className="border-b border-[var(--border)] bg-[var(--surface)] p-7">
            <Link href="/" className="inline-flex items-center" aria-label="Retour à l'accueil AlmaGo">
              <BrandLogo className="h-auto w-40" />
            </Link>
          </div>

          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent-strong)]">Réinitialisation</p>
            <h1 className="editorial-accent mt-4 max-w-xl text-3xl leading-[1.08] text-[var(--foreground)]">
              Choisissez un nouveau mot de passe pour retrouver votre espace.
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              Cette étape sécurise l&apos;accès à votre dossier étudiant. Après validation, vous serez redirigé vers votre tableau de bord.
            </p>

            <div className="mt-7 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">01</span>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Conseil sécurité</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Utilisez au moins 8 caractères et évitez un mot de passe déjà utilisé.</p>
                </div>
              </div>
              <div className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="text-xs font-bold tracking-[0.14em] text-[var(--accent-strong)]">02</span>
                <div>
                  <p className="text-sm font-bold text-[var(--foreground)]">Accès au dossier</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Le changement concerne seulement votre compte, pas les données enregistrées dans votre dossier.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[36rem]">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label="AlmaGo accueil">
              <BrandLogo className="h-auto w-32" />
            </Link>
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
              Connexion
            </Link>
          </div>
          <ResetPasswordForm />
        </section>
      </div>
    </main>
  );
}
