import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthStoryPanel } from "@/components/auth/AuthStoryPanel";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <AuthStoryPanel mode="login" />

        <section className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center" aria-label="AlmaGo accueil">
              <BrandLogo className="h-auto w-32" />
            </Link>
            <Link href="/signup" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]">
              Créer un compte
            </Link>
          </div>
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
