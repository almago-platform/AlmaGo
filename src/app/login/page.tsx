import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthStoryPanel } from "@/components/auth/AuthStoryPanel";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-slate-950 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.92fr_1.08fr]">
        <AuthStoryPanel mode="login" />

        <section className="mx-auto w-full max-w-xl">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)]">
              <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-xs text-white">A</span>
              AlmaGo
            </Link>
            <Link href="/signup" className="text-sm font-semibold text-slate-600 hover:text-[var(--brand)]">
              Créer un compte
            </Link>
          </div>
          <AuthForm />
        </section>
      </div>
    </main>
  );
}
