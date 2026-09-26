"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  ["Mon dossier", "/student"],
  ["Mon profil", "/student/profile"],
  ["Mes documents", "/student/documents"],
  ["Mon orientation", "/student/orientation"],
  ["Mes démarches", "/student/checklist"],
  ["Mes candidatures", "/student/applications"],
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
    <nav className="border-b border-[var(--border)] bg-[var(--surface)]" aria-label="Navigation étudiant">
      <div className="mx-auto max-w-6xl px-3 py-3 min-[360px]:px-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/student"
            className="shrink-0 rounded-[var(--radius-control)] text-lg font-bold text-[var(--brand)]"
            aria-label="Accueil AlmaGo"
          >
            AlmaGo
          </Link>

          <button
            type="button"
            onClick={signOut}
            aria-label="Se déconnecter"
            className="min-h-10 shrink-0 rounded-[var(--radius-control)] px-2.5 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950 min-[360px]:min-h-11 min-[360px]:px-3 min-[360px]:text-sm"
          >
            <span className="min-[360px]:hidden">Quitter</span>
            <span className="hidden min-[360px]:inline">Déconnexion</span>
          </button>
        </div>

        <div className="mobile-nav-scroll mt-2 flex snap-x snap-mandatory gap-1 overflow-x-auto overscroll-x-contain scroll-px-1">
          {links.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 max-w-[11rem] shrink-0 snap-start whitespace-nowrap rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand)]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
