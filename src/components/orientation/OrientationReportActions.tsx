"use client";

export function OrientationReportActions({ printLabel }: { printLabel: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)]"
    >
      {printLabel}
    </button>
  );
}
