"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function AdminDossierDisclosure({
  title,
  description,
  targetIds,
  initiallyOpen = false,
  children,
}: {
  title: string;
  description?: string;
  targetIds: string[];
  initiallyOpen?: boolean;
  children: ReactNode;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const targetsKey = targetIds.join("|");

  useEffect(() => {
    const ids = new Set(targetsKey.split("|"));

    function reveal(id: string) {
      if (!ids.has(id)) return;
      const details = detailsRef.current;
      if (!details) return;
      details.open = true;
      window.requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ block: "start" });
      });
    }

    function revealFromLocation() {
      const rawHash = window.location.hash.slice(1);
      if (!rawHash) return;
      try {
        reveal(decodeURIComponent(rawHash));
      } catch {
        // Ignore malformed external fragments without breaking the dossier.
      }
    }

    function revealOnClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (id) reveal(id);
    }

    revealFromLocation();
    window.addEventListener("hashchange", revealFromLocation);
    document.addEventListener("click", revealOnClick);
    return () => {
      window.removeEventListener("hashchange", revealFromLocation);
      document.removeEventListener("click", revealOnClick);
    };
  }, [targetsKey]);

  return (
    <details
      ref={detailsRef}
      open={initiallyOpen}
      className="group min-w-0 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)]"
    >
      <summary className="flex min-h-14 cursor-pointer list-none items-start gap-3 rounded-[var(--radius-panel)] px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="mt-1 text-sm text-[var(--brand-strong)] transition-transform group-open:rotate-90">▸</span>
        <span className="min-w-0">
          <span className="block text-base font-bold text-slate-950">{title}</span>
          {description ? <span className="mt-1 block text-xs leading-5 text-slate-600">{description}</span> : null}
        </span>
        <span className="ms-auto shrink-0 text-xs font-semibold text-[var(--brand-strong)] group-open:hidden">Afficher</span>
        <span className="ms-auto hidden shrink-0 text-xs font-semibold text-[var(--brand-strong)] group-open:inline">Réduire</span>
      </summary>
      <div className="space-y-6 border-t border-[var(--border)] p-3 sm:p-4">{children}</div>
    </details>
  );
}
