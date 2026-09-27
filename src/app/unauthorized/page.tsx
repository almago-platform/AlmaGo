import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-sm sm:p-10">
          <Link href="/" className="mx-auto inline-flex items-center" aria-label="Retour à l'accueil AlmaGo">
            <BrandLogo className="h-auto w-48" />
          </Link>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-[#f2d37b] bg-[#fff0bf] px-4 py-2 text-sm font-bold text-[#8b6200]">
            Autorisation requise
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Cet espace est réservé à l&apos;équipe AlmaGo.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">
            Ton compte est bien connecté, mais il ne possède pas les droits nécessaires pour ouvrir cette zone administrative.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/student"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[var(--brand-strong)]"
            >
              Retour au tableau de bord
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 font-bold text-[var(--foreground)] shadow-sm transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Changer de compte
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
