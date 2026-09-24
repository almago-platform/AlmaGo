import type { Metadata } from "next";
import Link from "next/link";
import { HomeHeader } from "@/components/public/HomeHeader";
import { HomeFooter } from "@/components/public/HomeClosing";

export const metadata: Metadata = {
  title: "Page introuvable | AlmaGo",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-slate-950">
      <HomeHeader />

      <section className="bg-[#fbfaf8] py-16 sm:py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            Page introuvable
          </span>
          <p className="mt-7 text-6xl font-bold tracking-[-0.06em] text-[var(--brand)] sm:text-7xl">
            404
          </p>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Cette page n’est pas disponible.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Le lien peut être ancien, incomplet ou la page peut avoir changé. Aucun élément de votre dossier n’est modifié par cette erreur.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] bg-[var(--brand)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--brand-strong)]"
            >
              Retour à l’accueil
            </Link>
            <Link
              href="/aide"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-white px-6 text-sm font-bold text-[var(--brand)] transition-colors hover:border-[var(--brand)]"
            >
              Ouvrir le Centre d’aide
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-6 text-sm font-bold text-slate-700 transition-colors hover:text-[var(--brand)]"
            >
              Accéder à mon dossier
            </Link>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 text-left shadow-[var(--shadow-card)]">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Vous cherchiez peut-être
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <QuickLink href="/comprendre-les-demarches" label="Comprendre les démarches" />
              <QuickLink href="/selon-votre-pays" label="Selon votre pays de diplôme" />
              <QuickLink href="/sources-officielles" label="Sources officielles" />
              <QuickLink href="/confiance" label="Confiance et transparence" />
            </div>
          </div>
        </div>
      </section>

      <HomeFooter />
    </main>
  );
}

function QuickLink({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <Link
      href={href}
      className="flex min-h-11 items-center justify-between rounded-[var(--radius-control)] border border-[var(--border)] bg-[#fbfaf8] px-4 text-sm font-bold text-slate-700 transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)]"
    >
      <span>{label}</span>
      <span aria-hidden="true">→</span>
    </Link>
  );
}
