export default function OrientationLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement des recommandations…</span>
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-10 max-w-xl animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    </main>
  );
}
