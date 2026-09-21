export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
        AlmaGo · V1
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
        Étudier en Allemagne, étape par étape.
      </h1>
      <p className="max-w-xl text-lg leading-8 text-slate-600">
        La base technique est prête pour construire les espaces étudiant et admin.
      </p>
      <p className="text-sm text-slate-500">
        Phase 1 · socle Next.js, Tailwind et Supabase
      </p>
    </main>
  );
}
