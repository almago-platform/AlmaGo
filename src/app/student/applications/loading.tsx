export default function ApplicationsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement des candidatures…</span>
      <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 h-10 max-w-xl animate-pulse rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
      </div>
      <div className="mt-8 h-80 animate-pulse rounded-3xl bg-slate-200" />
    </main>
  );
}
