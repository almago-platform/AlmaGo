import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthStoryPanel } from "@/components/auth/AuthStoryPanel";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_48%,#f1ece4_100%)] px-4 py-5 text-[var(--foreground)] sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] w-full max-w-7xl items-center gap-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10">
        <AuthStoryPanel mode="signup" />

        <section className="mx-auto w-full max-w-[36rem]">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex min-h-11 items-center" aria-label="AlmaGo accueil">
              <BrandLogo className="h-auto w-32" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
            >
              Connexion
            </Link>
          </div>

          <div className="mb-4 flex items-center gap-2 lg:hidden" aria-label="Progression de création du dossier">
            <span className="h-1.5 flex-1 rounded-full bg-[var(--brand)]" />
            <span className="h-1.5 flex-1 rounded-full bg-[var(--border)]" />
            <span className="h-1.5 flex-1 rounded-full bg-[var(--border)]" />
          </div>

          <AuthForm initialMode="signup" />
        </section>
      </div>
    </main>
  );
}
