"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type AppShellRole = "student" | "admin";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  helper?: string;
};

const iconClass = "h-5 w-5 shrink-0";

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" /></svg>,
  profile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4.5 20c.8-4 3.2-6 7.5-6s6.7 2 7.5 6" /></svg>,
  documents: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>,
  orientation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" /></svg>,
  checklist: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M3.5 6l1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2" /></svg>,
  applications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M5 5h14v16H5z" /><path d="M9 3h6v4H9zM8 11h8M8 15h8" /></svg>,
  deadlines: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" /></svg>,
  notifications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 6 2.5 6 2.5 8H4c0-2 2.5-2 2.5-8Z" /><path d="M9.5 20h5" /></svg>,
  universities: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M21 10v6" /></svg>,
  programs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
};

const studentItems: NavItem[] = [
  { label: "Mon dossier", href: "/student", icon: icons.dashboard, helper: "Vue d’ensemble" },
  { label: "Mon profil", href: "/student/profile", icon: icons.profile, helper: "Mes informations" },
  { label: "Mes documents", href: "/student/documents", icon: icons.documents, helper: "Pièces et statuts" },
  { label: "Mon orientation", href: "/student/orientation", icon: icons.orientation, helper: "Programmes proposés" },
  { label: "Mes démarches", href: "/student/checklist", icon: icons.checklist, helper: "Étapes du dossier" },
  { label: "Mes échéances", href: "/student/echeances", icon: icons.deadlines, helper: "Dates du dossier" },
  { label: "Mes notifications", href: "/student/notifications", icon: icons.notifications, helper: "Mises à jour du dossier" },
  { label: "Mes candidatures", href: "/student/applications", icon: icons.applications, helper: "Suivi des dossiers" },
];

const adminItems: NavItem[] = [
  { label: "Vue d’ensemble", href: "/admin", icon: icons.dashboard, helper: "Priorités de l’équipe" },
  { label: "Documents", href: "/admin/documents", icon: icons.documents, helper: "Pièces à vérifier" },
  { label: "Candidatures", href: "/admin/applications", icon: icons.applications, helper: "Dossiers et échéances" },
  { label: "Orientation", href: "/admin/orientation", icon: icons.orientation, helper: "Pistes d’orientation" },
  { label: "Universités", href: "/admin/universities", icon: icons.universities, helper: "Catalogue établissements" },
  { label: "Programmes", href: "/admin/programs", icon: icons.programs, helper: "Catalogue formations" },
];

function isActive(pathname: string, href: string) {
  if (href === "/student" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  role,
  children,
  displayName,
}: Readonly<{
  role: AppShellRole;
  children: ReactNode;
  displayName?: string | null;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = role === "admin" ? adminItems : studentItems;
  const currentItem = items.find((item) => isActive(pathname, item.href)) || items[0];
  const studentName = displayName?.trim() || "étudiant";


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

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[18.5rem] lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[#fbfbfd] lg:shadow-[14px_0_42px_-34px_rgba(15,23,42,0.3)]">
        <div className="relative flex min-h-24 items-center border-b border-[var(--border)] px-6">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--brand)] to-[var(--accent)]" />
          <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center gap-3" aria-label="Accueil AlmaGo">
            <span className="relative grid h-11 w-11 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white shadow-[0_12px_26px_-16px_rgba(41,48,139,0.9)]">
              A
              <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-slate-950">AlmaGo</span>
              <span className="block text-xs font-medium leading-4 text-slate-500">
                {role === "admin" ? "Espace administration" : "Votre espace étudiant"}
              </span>
            </span>
          </Link>
        </div>

        {role === "student" ? (
          <div className="mx-4 mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre parcours Allemagne</p>
            <p className="mt-2 text-sm font-bold text-slate-900">Bonjour {studentName}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Retrouvez ici ce qui est prêt, ce qui reste à vérifier et votre prochaine étape.
            </p>
          </div>
        ) : (
          <div className="mx-4 mt-5 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Suivi de l’équipe</p>
            <p className="mt-2 text-sm font-bold text-slate-900">Priorités du jour</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Traitez d’abord les blocages dossier, puis maintenez le catalogue.
            </p>
          </div>
        )}

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-4 py-5 before:mb-3 before:block before:px-3.5 before:text-[10px] before:font-bold before:uppercase before:tracking-[0.18em] before:text-slate-400 before:content-['Navigation']"
          aria-label={role === "admin" ? "Navigation administration" : "Navigation étudiant"}
        >
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group relative flex min-h-12 items-center gap-3 rounded-[var(--radius-control)] px-3.5 py-2.5 transition-all duration-150 ${active ? "bg-white text-[var(--brand)] shadow-[0_8px_22px_-18px_rgba(41,48,139,0.75)] ring-1 ring-[var(--brand-border)]" : "text-slate-600 hover:translate-x-0.5 hover:bg-white hover:text-slate-950 hover:shadow-sm"}`}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "bg-[var(--brand-soft)] text-[var(--accent-strong)]" : "bg-transparent text-slate-400 group-hover:text-slate-600"}`}>
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                  {item.helper && (
                    <span className={`mt-0.5 block text-[11px] leading-4 ${active ? "text-[var(--brand)]/75" : "text-slate-400"}`}>
                      {item.helper}
                    </span>
                  )}
                </span>
                {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-[var(--accent)]" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--border)] bg-white/75 p-4">
          {role === "student" ? (
            <div className="mb-3 space-y-2">
              <p className="px-1 text-[11px] leading-4 text-slate-500">
                AlmaGo organise votre dossier. Les décisions officielles restent celles des organismes compétents.
              </p>
              <Link
                href="/aide"
                className="flex min-h-11 items-center justify-between rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 px-3 text-sm font-bold text-[var(--brand)] transition-colors hover:bg-[var(--brand-soft)]"
              >
                <span>Centre d’aide</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          ) : (
            <p className="mb-3 px-1 text-[11px] leading-4 text-slate-500">
              Les actions d’administration peuvent modifier ce qui est visible dans l’espace étudiant.
            </p>
          )}
          <Button type="button" onClick={signOut} variant="secondary" className="w-full justify-start">
            Déconnexion
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[18.5rem]">
        {role === "student" ? (
          <>
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-22px_rgba(15,23,42,0.35)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/student" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label="Accueil AlmaGo">
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">
                    A
                    <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-4 text-slate-950">AlmaGo</span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500">{currentItem.label}</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="student-mobile-menu"
                  aria-label={mobileMenuOpen ? "Fermer le menu étudiant" : "Ouvrir le menu étudiant"}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
                >
                  {mobileMenuOpen ? icons.close : icons.menu}
                  <span className="hidden min-[340px]:inline">{mobileMenuOpen ? "Fermer" : "Menu"}</span>
                </button>
              </div>

              {mobileMenuOpen && (
                <div id="student-mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[#fbfbfd] px-3 py-4 min-[360px]:px-4">
                  <div className="mb-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-3.5">
                    <p className="text-xs font-bold text-slate-900">Bonjour {studentName}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Choisissez la partie de votre dossier que vous souhaitez consulter.</p>
                  </div>

                  <nav className="grid gap-2 sm:grid-cols-2" aria-label="Navigation étudiant mobile">
                    {studentItems.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-white text-[var(--brand)] shadow-sm" : "border-transparent bg-white/65 text-slate-700 hover:border-[var(--border)] hover:bg-white"}`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "bg-[var(--brand-soft)] text-[var(--accent-strong)]" : "bg-slate-100 text-slate-500"}`}>
                            {item.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[11px] text-slate-500">{item.helper}</span>}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-4 grid gap-2 border-t border-[var(--border)] pt-4">
                    <Link
                      href="/aide"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/55 px-4 text-sm font-bold text-[var(--brand)]"
                    >
                      Centre d’aide
                    </Link>
                    <Button type="button" onClick={signOut} variant="secondary" className="w-full justify-center">
                      Déconnexion
                    </Button>
                  </div>
                </div>
              )}
            </header>

            <div className="hidden min-h-[4.75rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-white/85 px-6 backdrop-blur lg:flex xl:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{currentItem.label}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Bonjour {studentName}. Voici ce qui compte aujourd’hui pour votre projet d’études.
                </p>
              </div>
              <div className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-semibold text-slate-600">
                Dossier personnel
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/95 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-22px_rgba(15,23,42,0.35)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label="Accueil AlmaGo">
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-[var(--brand)] text-sm font-bold text-white">
                    A
                    <span aria-hidden="true" className="absolute -bottom-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--accent)]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-4 text-slate-950">AlmaGo</span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500">{currentItem.label}</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="admin-mobile-menu"
                  aria-label={mobileMenuOpen ? "Fermer le menu administration" : "Ouvrir le menu administration"}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-white px-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
                >
                  {mobileMenuOpen ? icons.close : icons.menu}
                  <span className="hidden min-[340px]:inline">{mobileMenuOpen ? "Fermer" : "Menu"}</span>
                </button>
              </div>

              {mobileMenuOpen && (
                <div id="admin-mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[#fbfbfd] px-3 py-4 min-[360px]:px-4">
                  <div className="mb-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-3.5">
                    <p className="text-xs font-bold text-slate-900">Espace administration</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Choisissez la file de travail ou la partie du catalogue à gérer.</p>
                  </div>

                  <nav className="grid gap-2 sm:grid-cols-2" aria-label="Navigation administration mobile">
                    {adminItems.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-white text-[var(--brand)] shadow-sm" : "border-transparent bg-white/65 text-slate-700 hover:border-[var(--border)] hover:bg-white"}`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "bg-[var(--brand-soft)] text-[var(--accent-strong)]" : "bg-slate-100 text-slate-500"}`}>
                            {item.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">{item.helper}</span>}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <Button type="button" onClick={signOut} variant="secondary" className="w-full justify-center">
                      Déconnexion
                    </Button>
                  </div>
                </div>
              )}
            </header>

            <div className="hidden min-h-[4.75rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-white/85 px-6 backdrop-blur lg:flex xl:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{currentItem.label}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {currentItem.helper || "Suivi des opérations AlmaGo"}
                </p>
              </div>
              <div className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2 text-xs font-semibold text-slate-600">
                Espace équipe
              </div>
            </div>
          </>
        )}

        <div id="main-content" tabIndex={-1} className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
