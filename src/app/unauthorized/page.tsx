import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <Link href="/" className="mx-auto inline-flex items-center gap-3" aria-label="Retour à l'accueil AlmaGo">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-700 text-lg font-bold text-white shadow-sm">
              A
            </span>
            <span className="text-left">
              <span className="block text-lg font-bold tracking-tight">AlmaGo</span>
              <span className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                Accès sécurisé
              </span>
            </span>
          </Link>

          <p className="mx-auto mt-10 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800">
            Autorisation requise
          </p>
          <h1 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Cet espace est réservé à l&apos;équipe AlmaGo.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            Ton compte est bien connecté, mais il ne possède pas les droits nécessaires pour ouvrir cette zone administrative.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/student"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-700 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-emerald-800"
            >
              Retour au tableau de bord
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 font-bold text-slate-900 shadow-sm transition hover:border-emerald-300 hover:text-emerald-800"
            >
              Changer de compte
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
