export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`ds-skeleton block rounded-[var(--radius-control)] ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Chargement" className="space-y-5">
      <span className="sr-only">Chargement…</span>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-full max-w-2xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
