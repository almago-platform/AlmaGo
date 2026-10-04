"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const primaryLinks = [
  ["Accueil", "/student"],
  ["Mon projet", "/student/checklist"],
  ["Programmes", "/student/orientation"],
  ["Documents", "/student/documents"],
  ["Candidatures", "/student/applications"],
] as const;

const secondaryLinks = [
  ["Profil", "/student/profile"],
  ["Cours de langue", "/student/language-courses"],
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/student") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur" aria-label="Navigation étudiant">
      <div className="mx-auto max-w-6xl px-3 py-3 min-[360px]:px-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/student"
            className="shrink-0 rounded-[var(--radius-control)] text-lg font-bold tracking-[-0.03em] text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            aria-label="Accueil AlmaGo"
          >
            AlmaGo
          </Link>

          <div className="flex items-center gap-1">
            {secondaryLinks.map(([label, href]) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`hidden min-h-11 items-center rounded-[var(--radius-control)] px-3 text-sm font-medium sm:inline-flex ${active ? "bg-[var(--brand-soft)] text-[var(--brand-strong)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"}`}
                >
                  {label}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={signOut}
              className="min-h-11 rounded-[var(--radius-control)] px-3 text-sm font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="mobile-nav-scroll mt-2 flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain scroll-px-1" aria-label="Sections principales">
          {primaryLinks.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 shrink-0 snap-start whitespace-nowrap rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-1 ${active ? "bg-[var(--brand)] font-semibold text-white" : "font-medium text-[var(--foreground-soft)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"}`}
              >
                {label}
              </Link>
            );
          })}
          {secondaryLinks.map(([label, href]) => (
            <Link key={href} href={href} className="min-h-11 shrink-0 snap-start rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-subtle)] sm:hidden">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
