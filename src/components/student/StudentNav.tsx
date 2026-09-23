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
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link
          href="/student"
          className="mr-2 shrink-0 rounded-[var(--radius-control)] text-lg font-bold text-[var(--brand)]"
          aria-label="Accueil AlmaGo"
        >
          AlmaGo
        </Link>

        <div className="mobile-nav-scroll flex min-w-0 flex-1 snap-x snap-mandatory gap-1 overflow-x-auto">
          {links.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 shrink-0 snap-start rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] font-semibold text-[var(--brand)]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <button
          type="button"
          onClick={signOut}
          className="min-h-11 shrink-0 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
