"use client";

import { useOrientationPrintReadiness } from "@/components/orientation/OrientationPrintReadinessProvider";

export type OrientationPrintMode = "summary" | "detailed";

export function printOrientationDocument(mode: OrientationPrintMode = "summary") {
  const root = document.documentElement;
  root.setAttribute("data-orientation-print-mode", mode);
  const reset = () => root.removeAttribute("data-orientation-print-mode");
  window.addEventListener("afterprint", reset, { once: true });
  try {
    window.print();
  } catch (error) {
    window.removeEventListener("afterprint", reset);
    reset();
    throw error;
  }
}

export function OrientationReportActions({
  printLabel,
  mode = "summary",
}: {
  printLabel: string;
  mode?: OrientationPrintMode;
}) {
  const { ready } = useOrientationPrintReadiness();
  const disabled = mode === "detailed" && !ready;
  return (
    <button
      type="button"
      disabled={disabled}
      aria-busy={disabled}
      onClick={() => printOrientationDocument(mode)}
      className="rounded-[var(--radius-control)] bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white hover:bg-[var(--brand-strong)] disabled:cursor-wait disabled:opacity-60"
    >
      {printLabel}
    </button>
  );
}
