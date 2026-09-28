"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
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
  universities: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M21 10v6" /></svg>,
  programs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
};

const studentItems: NavItem[] = [
  { label: "Mon dossier", href: "/student", icon: icons.dashboard, helper: "Vue d’ensemble" },
  { label: "Mon projet", href: "/student/project", icon: icons.universities, helper: "Point de départ" },
  { label: "Mon parcours", href: "/student/pathway", icon: icons.checklist, helper: "Mes étapes en Allemagne" },
  { label: "Mon profil", href: "/student/profile", icon: icons.profile, helper: "Mes informations" },
  { label: "Mes documents", href: "/student/documents", icon: icons.documents, helper: "Pièces et statuts" },
  { label: "Mes programmes", href: "/student/orientation", icon: icons.orientation, helper: "Programmes à comparer" },
  { label: "Cours de langue", href: "/student/language-courses", icon: icons.programs, helper: "Cours à comparer" },
  { label: "Financement & assurance", href: "/student/finance-insurance", icon: icons.applications, helper: "Options vérifiées" },
  { label: "Mes démarches", href: "/student/checklist", icon: icons.checklist, helper: "Étapes du dossier" },
  { label: "Mes candidatures", href: "/student/applications", icon: icons.applications, helper: "Suivi et échéances" },
];

const studentGroupIndexes = [
  [0, 1, 3],
  [2, 4, 5, 8, 9],
  [6, 7],
] as const;

const adminItems: NavItem[] = [
  { label: "Vue d’ensemble", href: "/admin", icon: icons.dashboard, helper: "Priorités de l’équipe" },
  { label: "Documents", href: "/admin/documents", icon: icons.documents, helper: "Pièces à vérifier" },
  { label: "Candidatures", href: "/admin/applications", icon: icons.applications, helper: "Dossiers et échéances" },
  { label: "Orientation", href: "/admin/orientation", icon: icons.orientation, helper: "Recommandations étudiants" },
  { label: "Universités", href: "/admin/universities", icon: icons.universities, helper: "Établissements" },
  { label: "Programmes", href: "/admin/programs", icon: icons.programs, helper: "Formations" },
  { label: "Cours de langue", href: "/admin/language-courses", icon: icons.programs, helper: "Préparation linguistique" },
  { label: "Finance & assurance", href: "/admin/finance-insurance", icon: icons.applications, helper: "Options factuelles" },
];

const adminGroups = [
  { label: "Pilotage", items: adminItems.slice(0, 1) },
  { label: "Opérations", items: adminItems.slice(1, 4) },
  { label: "Catalogue Allemagne", items: adminItems.slice(4) },
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
  const { copy, direction } = useLocale();
  const shell = copy.shell;
  const localizedStudentItems = studentItems.map((item, index) => ({
    ...item,
    label: shell.items[index][0],
    helper: shell.items[index][1],
  }));
  const studentGroups = studentGroupIndexes.map((indexes, groupIndex) => ({
    label: shell.groups[groupIndex],
    items: indexes.map((index) => localizedStudentItems[index]),
  }));
  const items = role === "admin" ? adminItems : localizedStudentItems;
  const currentItem = items.find((item) => isActive(pathname, item.href)) || items[0];
  const studentName = displayName?.trim() || shell.studentNameFallback;


  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div dir={role === "admin" ? "ltr" : direction} className="min-h-screen bg-[var(--background)]">
      <a href="#main-content" className="skip-link">
        {role === "student" ? shell.skip : "Aller au contenu"}
      </a>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[15.5rem] lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[var(--surface)]">
        <div className="flex min-h-20 items-center border-b border-[var(--border)] px-5">
          <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center" aria-label="Accueil AlmaGo">
            <BrandLogo className="h-auto w-[9.5rem]" />
          </Link>
        </div>

        {role === "student" ? (
          <div className="mx-5 border-b border-[var(--border)] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{shell.studentFile}</p>
            <p className="mt-1 text-sm font-bold text-[var(--foreground)]">{studentName}</p>
            <p className="mt-1 text-[11px] leading-4 text-[var(--muted)]">{shell.studyProject}</p>
          </div>
        ) : (
          <div className="mx-5 border-b border-[var(--border)] py-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Administration</p>
            <p className="mt-1 text-sm font-bold text-[var(--foreground)]">Pilotage opérationnel</p>
            <p className="mt-1 text-[11px] leading-4 text-[var(--muted)]">Dossiers, catalogues et revalidations</p>
          </div>
        )}

        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
          aria-label={role === "admin" ? "Navigation administration" : shell.studentNavigation}
        >
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
            {role === "admin" ? "Espace de travail" : shell.navigation}
          </p>
          {role === "admin" ? (
            <div className="space-y-4">
              {adminGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`group relative flex min-h-10 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand)] ring-1 ring-[var(--brand-border)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"}`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>{item.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-[0.82rem] font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[10px] leading-3.5 text-[var(--muted)]">{item.helper}</span>}
                          </span>
                          {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-[var(--accent)]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {studentGroups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={`group relative flex min-h-10 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand)] ring-1 ring-[var(--brand-border)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"}`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>{item.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-[0.82rem] font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[10px] leading-3.5 text-[var(--muted)]">{item.helper}</span>}
                          </span>
                          {active && <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-[var(--accent)]" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-[var(--border)] bg-[var(--surface-subtle)] p-4">
          {role === "student" ? (
            <>
              <div className="mb-3 px-1"><LanguageSwitcher /></div>
              <p className="mb-3 px-1 text-[11px] leading-4 text-[var(--muted)]">
                {shell.footer}
              </p>
            </>
          ) : (
            <p className="mb-3 px-1 text-[11px] leading-4 text-[var(--muted)]">
              Les actions d’administration peuvent modifier ce qui est visible dans l’espace étudiant.
            </p>
          )}
          <Button type="button" onClick={signOut} variant="secondary" className="w-full justify-start">
            {role === "student" ? shell.logout : "Déconnexion"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[15.5rem]">
        {role === "student" ? (
          <>
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[#fffdf8]/95 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-22px_rgba(28,33,36,0.24)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/student" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label="Accueil AlmaGo">
                  <span className="grid h-10 w-10 shrink-0 place-items-center"><BrandLogo symbolOnly className="h-10 w-10 object-contain" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-4 text-[var(--foreground)]">AlmaGo</span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-[var(--muted)]">{currentItem.label}</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="student-mobile-menu"
                  aria-label={mobileMenuOpen ? shell.closeMenu : shell.openMenu}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-bold text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
                >
                  {mobileMenuOpen ? icons.close : icons.menu}
                  <span className="hidden min-[340px]:inline">{mobileMenuOpen ? shell.close : shell.menu}</span>
                </button>
              </div>

              {mobileMenuOpen && (
                <div id="student-mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-4 min-[360px]:px-4">
                  <div className="mb-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-[var(--foreground)]">{shell.hello} {studentName}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{shell.mobileIntro}</p>
                      </div>
                      <LanguageSwitcher compact />
                    </div>
                  </div>

                  <nav className="space-y-4" aria-label={shell.studentMobileNavigation}>
                    {studentGroups.map((group) => (
                      <section key={group.label} aria-label={group.label}>
                        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">{group.label}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.items.map((item) => {
                            const active = isActive(pathname, item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                aria-current={active ? "page" : undefined}
                                className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-[var(--surface)] text-[var(--brand)] shadow-sm" : "border-transparent bg-[#fffdf8]/80 text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface)]"}`}
                              >
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "bg-[var(--brand-soft)] text-[var(--accent-strong)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
                                  {item.icon}
                                </span>
                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                                  {item.helper && <span className="mt-0.5 block text-[11px] text-[var(--muted)]">{item.helper}</span>}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </nav>

                  <div className="mt-4 border-t border-[var(--border)] pt-4">
                    <Button type="button" onClick={signOut} variant="secondary" className="w-full justify-center">
                      {shell.logout}
                    </Button>
                  </div>
                </div>
              )}
            </header>

            <div className="hidden min-h-[4.5rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-[var(--surface)] px-6 lg:flex xl:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{currentItem.label}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {shell.hello} {studentName}. {shell.desktopIntro}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <LanguageSwitcher compact />
                <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
                  {shell.personalFile}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[#fffdf8]/95 pt-[env(safe-area-inset-top)] shadow-[0_8px_24px_-22px_rgba(28,33,36,0.24)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label="Accueil AlmaGo">
                  <span className="grid h-10 w-10 shrink-0 place-items-center"><BrandLogo symbolOnly className="h-10 w-10 object-contain" /></span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-4 text-[var(--foreground)]">AlmaGo</span>
                    <span className="mt-0.5 block truncate text-[11px] font-medium text-[var(--muted)]">{currentItem.label}</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="admin-mobile-menu"
                  aria-label={mobileMenuOpen ? "Fermer le menu administration" : "Ouvrir le menu administration"}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-bold text-[var(--foreground)] shadow-sm transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
                >
                  {mobileMenuOpen ? icons.close : icons.menu}
                  <span className="hidden min-[340px]:inline">{mobileMenuOpen ? "Fermer" : "Menu"}</span>
                </button>
              </div>

              {mobileMenuOpen && (
                <div id="admin-mobile-menu" className="max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-t border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-4 min-[360px]:px-4">
                  <div className="mb-4 rounded-[var(--radius-panel)] border border-[var(--brand-border)] bg-[var(--brand-soft)]/65 p-3.5">
                    <p className="text-xs font-bold text-[var(--foreground)]">Espace administration</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Choisissez la file de travail ou la partie du catalogue à gérer.</p>
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
                          className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-[var(--surface)] text-[var(--brand)] shadow-sm" : "border-transparent bg-[#fffdf8]/80 text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface)]"}`}
                        >
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "bg-[var(--brand-soft)] text-[var(--accent-strong)]" : "bg-[var(--surface-muted)] text-[var(--muted)]"}`}>
                            {item.icon}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[11px] leading-4 text-[var(--muted)]">{item.helper}</span>}
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

            <div className="hidden min-h-[4.75rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-[#fffdf8]/95 px-6 backdrop-blur lg:flex xl:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{currentItem.label}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {currentItem.helper || "Pilotage opérationnel AlmaGo"}
                </p>
              </div>
              <div className="rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--muted)]">
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
