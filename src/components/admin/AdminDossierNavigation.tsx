"use client";

import { useEffect, useRef, useState } from "react";

const primaryLinks = [
  { href: "#overview", label: "Résumé", counter: null },
  { href: "#actions", label: "Actions", counter: "actions" },
  { href: "#messages", label: "Messages", counter: "messages" },
  { href: "#documents", label: "Documents", counter: "documents" },
  { href: "#applications", label: "Candidatures", counter: "applications" },
  { href: "#history", label: "Historique", counter: null },
] as const;

const supplementaryLinks = [
  { href: "#blockers", label: "Blocages" },
  { href: "#followup", label: "Admission et suivi" },
  { href: "#progress", label: "Parcours" },
  { href: "#journal", label: "Journal interne" },
  { href: "#assignment", label: "Conseiller" },
  { href: "#project", label: "Projet" },
  { href: "#orientation", label: "Orientation" },
  { href: "#commercial", label: "Offre et paiement" },
] as const;

type Counts = {
  actions: number;
  messages: number;
  documents: number;
  applications: number;
};

export function AdminDossierNavigation({ counts }: { counts: Counts }) {
  const [activeHash, setActiveHash] = useState("#overview");
  const extraRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function syncHash() {
      const hash = window.location.hash || "#overview";
      setActiveHash(hash);

    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (extraRef.current && event.target instanceof Node && !extraRef.current.contains(event.target)) {
        extraRef.current.open = false;
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && extraRef.current?.open) {
        extraRef.current.open = false;
        extraRef.current.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const linkClass = (hash: string) =>
    `inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius-control)] border px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)] ${activeHash === hash
      ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)]"
      : "border-[var(--border)] bg-white text-slate-800 hover:border-[var(--brand-border)] hover:text-[var(--brand-strong)]"}`;

  return (
    <nav
      aria-label="Navigation du dossier"
      className="relative z-20 min-w-0 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-2.5 shadow-sm xl:sticky xl:top-0"
    >
      <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center xl:gap-3">
        <div className="flex shrink-0 items-center justify-between gap-2 px-1 xl:justify-start">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-700">Dossier 360°</span>
          <a href="#overview" className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--brand-strong)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            ↑ L’essentiel
          </a>
        </div>
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto pb-1 xl:pb-0" role="group" aria-label="Rubriques principales">
          {primaryLinks.map(({ href, label, counter }) => {
            const amount = counter ? counts[counter] : 0;
            return (
              <a
                key={href}
                href={href}
                aria-current={activeHash === href ? "location" : undefined}
                className={linkClass(href)}
              >
                {label}
                {amount > 0 ? (
                  <span className="rounded-full bg-[var(--surface-subtle)] px-1.5 py-0.5 text-xs tabular-nums" aria-label={`${amount} élément${amount > 1 ? "s" : ""}`}>
                    {amount}
                  </span>
                ) : null}
              </a>
            );
          })}
        </div>
        <details ref={extraRef} className="group relative min-w-0 shrink-0">
          <summary className="inline-flex min-h-10 cursor-pointer items-center rounded-[var(--radius-control)] border border-[var(--border)] px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-[var(--surface-subtle)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]">
            <span aria-hidden="true" className="me-2 transition-transform group-open:rotate-90">▸</span>
            Toutes les rubriques
          </summary>
          <div className="mt-2 grid min-w-0 grid-cols-2 gap-1.5 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-2 shadow-lg sm:grid-cols-3 xl:absolute xl:end-0 xl:top-full xl:z-30 xl:mt-1 xl:w-[min(34rem,calc(100vw-20rem))]">
            {supplementaryLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                aria-current={activeHash === href ? "location" : undefined}
                className={linkClass(href) + " whitespace-normal"}
                onClick={() => { if (extraRef.current) extraRef.current.open = false; }}
              >
                {label}
              </a>
            ))}
          </div>
        </details>
      </div>
    </nav>
  );
}
