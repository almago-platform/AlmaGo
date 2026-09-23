export default function ApplicationsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement des candidatures…</span>

      <div className="mb-7 flex flex-col gap-5 border-b border-[var(--border)] pb-5 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div className="min-w-0 flex-1">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="mt-4 h-10 w-full max-w-md animate-pulse rounded-[var(--radius-control)] bg-slate-200" />
          <div className="mt-3 h-5 w-full max-w-2xl animate-pulse rounded-[var(--radius-control)] bg-slate-100" />
        </div>
        <div className="h-11 w-44 animate-pulse rounded-[var(--radius-control)] bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]" />
        ))}
      </div>

      <div className="mt-6 space-y-3" aria-hidden="true">
        <div className="h-40 animate-pulse rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="h-40 animate-pulse rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    </main>
  );
}
