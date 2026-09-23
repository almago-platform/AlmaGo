export function ProgressBar({ value, label }: { value: number; label: string }) {
  const normalizedValue = Math.min(100, Math.max(0, value));
  return <div className="h-2.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={normalizedValue}>
    <div className="h-full rounded-full bg-[var(--accent)] transition-[width]" style={{ width: `${normalizedValue}%` }} />
  </div>;
}
