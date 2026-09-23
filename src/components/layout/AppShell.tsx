"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type AppShellRole = "student" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const iconClass = "h-5 w-5 shrink-0";

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.2-6 7.5-6s6.7 2 7.5 6" /></svg>,
  documents: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
  orientation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></svg>,
  checklist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></svg>,
  applications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M5 5h14v16H5z" /><path d="M9 3h6v4H9zM8 11h8M8 15h8" /></svg>,
  universities: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M21 10v6" /></svg>,
  programs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></svg>,
};

const studentItems: NavItem[] = [
  { label: "Mon dossier", href: "/student", icon: icons.dashboard },
  { label: "Mon profil", href: "/student/profile", icon: icons.profile },
  { label: "Mes documents", href: "/student/documents", icon: icons.documents },
  { label: "Mon orientation", href: "/student/orientation", icon: icons.orientation },
  { label: "Mes démarches", href: "/student/checklist", icon: icons.checklist },
  { label: "Mes candidatures", href: "/student/applications", icon: icons.applications },
];

const adminItems: NavItem[] = [
  { label: "Vue d’ensemble", href: "/admin", icon: icons.dashboard },
  { label: "Universités", href: "/admin/universities", icon: icons.universities },
  { label: "Programmes", href: "/admin/programs", icon: icons.programs },
  { label: "Orientation", href: "/admin/orientation", icon: icons.orientation },
  { label: "Candidatures", href: "/admin/applications", icon: icons.applications },
  { label: "Documents", href: "/admin/documents", icon: icons.documents },
];

function isActive(pathname: string, href: string) {
  if (href === "/student" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  role,
  children,
}: Readonly<{
  role: AppShellRole;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const items = role === "admin" ? adminItems : studentItems;

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[17.5rem] lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-20 items-center border-b border-slate-100 px-7">
          <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center gap-3" aria-label="Accueil AlmaGo">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--brand)] text-sm font-bold text-white shadow-sm">A</span>
            <span>
              <span className="block text-base font-bold tracking-tight text-slate-950 xl:text-lg">AlmaGo</span>
              <span className="block text-[11px] font-medium leading-4 text-slate-500 xl:text-xs">{role === "admin" ? "Espace administration" : "Espace étudiant"}</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6" aria-label={role === "admin" ? "Navigation administration" : "Navigation étudiant"}>
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3.5 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
              >
                <span className={active ? "text-[var(--accent-strong)]" : "text-slate-400 group-hover:text-slate-600"}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <Button
            type="button"
            onClick={signOut}
            variant="secondary"
            className="w-full justify-start"
          >
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center gap-2.5" aria-label="Accueil AlmaGo">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">A</span>
              <span>
                <span className="block text-base font-bold leading-none text-slate-950">AlmaGo</span>
                <span className="mt-1 block text-[11px] font-medium text-slate-500">{role === "admin" ? "Administration" : "Mon espace"}</span>
              </span>
            </Link>
            <Button type="button" onClick={signOut} variant="secondary" className="min-h-11 px-3 py-2">
              Déconnexion
            </Button>
          </div>

          <nav className="mobile-nav-scroll flex snap-x snap-mandatory gap-1 overflow-x-auto border-t border-slate-100 px-3 py-2" aria-label={role === "admin" ? "Navigation administration" : "Navigation étudiant"}>
            {items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <div id="main-content" tabIndex={-1} className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
