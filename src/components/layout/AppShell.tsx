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
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M5 4h14v16H5zM8 2v4M16 2v4M5 9h14" /><path d="M8.5 13h3M13.5 13h2M8.5 17h3" /></svg>,
  applications: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M5 5h14v16H5z" /><path d="M9 3h6v4H9zM8 11h8M8 15h8" /></svg>,
  universities: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M6 12v5c3 2 9 2 12 0v-5M21 10v6" /></svg>,
  programs: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></svg>,
  messages: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5.5h16v11H9l-5 4v-15Z" /><path d="M8 10h8M8 13h5" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
};

const studentItems: NavItem[] = [
  { label: "Tableau de bord", href: "/student", icon: icons.dashboard, helper: "Ma prochaine action" },
  { label: "Mon projet", href: "/student/project", icon: icons.universities, helper: "Objectif, rentrée et budget" },
  { label: "Mon profil", href: "/student/profile", icon: icons.profile, helper: "Mes informations" },
  { label: "Parcours Allemagne", href: "/student/pathway", icon: icons.checklist, helper: "Toutes mes étapes" },
  { label: "Mes programmes", href: "/student/orientation", icon: icons.orientation, helper: "Comparer et enregistrer" },
  { label: "Mes documents", href: "/student/documents", icon: icons.documents, helper: "Pièces, statuts et corrections" },
  { label: "Mes candidatures", href: "/student/applications", icon: icons.applications, helper: "Statuts et prochaines actions" },
  { label: "Calendrier", href: "/student/calendar", icon: icons.calendar, helper: "Deadlines importantes" },
  { label: "Ma procédure", href: "/student/procedure", icon: icons.checklist, helper: "Démarches liées à mon dossier" },
  { label: "Cours de langue", href: "/student/language-courses", icon: icons.programs, helper: "Préparation linguistique" },
  { label: "Financement & assurance", href: "/student/finance-insurance", icon: icons.applications, helper: "Préparer mon départ" },
];

const studentGroupIndexes = [
  [0],
  [1, 2, 3, 4, 5],
  [6, 7, 8],
  [9, 10],
] as const;

const adminItems: NavItem[] = [
  { label: "Vue d’ensemble", href: "/admin", icon: icons.dashboard, helper: "Priorités de l’équipe" },
  { label: "Boîte de réception", href: "/admin/inbox", icon: icons.documents, helper: "Événements à traiter" },
  { label: "Équipe", href: "/admin/team", icon: icons.profile, helper: "Charge et attribution" },
  { label: "Personnes", href: "/admin/people", icon: icons.profile, helper: "Prospects, candidats et étudiants" },
  { label: "Prospects", href: "/admin/prospects", icon: icons.orientation, helper: "Qualification des projets" },
  { label: "Dossiers Campus", href: "/admin/intake", icon: icons.checklist, helper: "Décisions et parcours" },
  { label: "Documents", href: "/admin/documents", icon: icons.documents, helper: "Pièces à vérifier" },
  { label: "Candidatures", href: "/admin/applications", icon: icons.applications, helper: "Dossiers et échéances" },
  { label: "Orientation", href: "/admin/orientation", icon: icons.orientation, helper: "Recommandations étudiants" },
  { label: "Paiements", href: "/admin/payments", icon: icons.applications, helper: "Validation et activation client" },
  { label: "Offres", href: "/admin/offers", icon: icons.applications, helper: "Bronze, Silver et Gold" },
  { label: "Universités", href: "/admin/universities", icon: icons.universities, helper: "Établissements" },
  { label: "Programmes", href: "/admin/programs", icon: icons.programs, helper: "Formations" },
  { label: "Cours de langue", href: "/admin/language-courses", icon: icons.programs, helper: "Préparation linguistique" },
  { label: "Finance & assurance", href: "/admin/finance-insurance", icon: icons.applications, helper: "Options factuelles" },
];

function isActive(pathname: string, href: string) {
  if (href === "/student" || href === "/admin") return pathname === href;
  if (href === "/admin/people" && pathname.startsWith("/admin/dossiers/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  role,
  children,
  displayName,
  partnerPrelaunch = false,
}: Readonly<{
  role: AppShellRole;
  children: ReactNode;
  displayName?: string | null;
  partnerPrelaunch?: boolean;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { copy, direction, locale } = useLocale();
  const shell = copy.shell;
  const shellHomeAria = role === "student" ? copy.common.homeAria : "Accueil AlmaGo";
  const localizedStudentBaseItems = studentItems.map((item, index) => ({
    ...item,
    label: shell.items[index][0],
    helper: shell.items[index][1],
  }));
  const messageNavCopy = {
    fr: ["Messages", "Écrire à Campus Allemagne"],
    ar: ["الرسائل", "التواصل مع Campus Allemagne"],
    en: ["Messages", "Contact Campus Allemagne"],
    de: ["Nachrichten", "Campus Allemagne kontaktieren"],
  } as const;
  const localizedStudentItems: NavItem[] = [
    ...localizedStudentBaseItems,
    {
      label: messageNavCopy[locale][0],
      href: "/student/messages",
      icon: icons.messages,
      helper: messageNavCopy[locale][1],
    },
  ];
  const studentGroups = studentGroupIndexes.map((indexes, groupIndex) => ({
    label: shell.groups[groupIndex],
    items: indexes.map((index) => localizedStudentItems[index]),
  }));
  studentGroups[0]?.items.push(localizedStudentItems[11]);
  const partnerDemoItem: NavItem = {
    label: "Démo partenaires",
    href: "/admin/partner-demo",
    icon: icons.orientation,
    helper: "E-mail & paiement sandbox",
  };
  const currentAdminItems = partnerPrelaunch
    ? [...adminItems, partnerDemoItem]
    : adminItems;
  const adminGroups = [
    {
      label: "Pilotage",
      items: currentAdminItems.filter((item) =>
        ["/admin", "/admin/inbox", "/admin/team"].includes(item.href),
      ),
    },
    {
      label: "Personnes",
      items: currentAdminItems.filter((item) =>
        ["/admin/people", "/admin/prospects"].includes(item.href),
      ),
    },
    {
      label: "Files de travail",
      items: currentAdminItems.filter((item) =>
        ["/admin/intake", "/admin/documents", "/admin/applications", "/admin/orientation", "/admin/payments"].includes(item.href),
      ),
    },
    { label: "Commercial", items: currentAdminItems.filter((item) => item.href === "/admin/offers") },
    {
      label: "Catalogue Allemagne",
      items: currentAdminItems.filter((item) =>
        ["/admin/universities", "/admin/programs", "/admin/language-courses", "/admin/finance-insurance"].includes(item.href),
      ),
    },
    ...(partnerPrelaunch
      ? [{ label: "Pré-lancement", items: currentAdminItems.filter((item) => item.href === "/admin/partner-demo") }]
      : []),
  ];
  const items = role === "admin" ? currentAdminItems : localizedStudentItems;
  const currentItem = items.find((item) => isActive(pathname, item.href)) || items[0];
  const studentName = displayName?.trim() || shell.studentNameFallback;


  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div dir={role === "admin" ? "ltr" : direction} className={`${role === "student" ? "student-shell" : "admin-shell"} min-h-screen bg-[var(--background)]`}>
      <a href="#main-content" className="skip-link">
        {role === "student" ? shell.skip : "Aller au contenu"}
      </a>

      <aside className={`student-shell-sidebar admin-shell-sidebar hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[15.5rem] lg:flex-col lg:border-[var(--border)] lg:bg-[var(--surface)] ${role === "student" ? "lg:start-0 lg:border-e" : "lg:left-0 lg:border-r"}`}>
        <div className="flex min-h-20 items-center border-b border-[var(--border)] px-5">
          <Link href={role === "admin" ? "/admin" : "/student"} className="flex items-center" aria-label={shellHomeAria}>
            <BrandLogo className="h-auto w-[13rem]" />
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
                          className={`group relative flex min-h-10 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-1 ring-[var(--brand-border)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"}`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>{item.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-[0.82rem] font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[10px] leading-3.5 text-[var(--brand-strong)]">{item.helper}</span>}
                          </span>
                          {active && <span aria-hidden="true" className="student-shell-active-edge absolute inset-y-2 start-0 w-0.5 rounded-e-full bg-[var(--accent)]" />}
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
                          className={`group relative flex min-h-10 items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 py-1.5 transition-colors duration-150 ${active ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-1 ring-[var(--brand-border)]" : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]"}`}
                        >
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-control)] ${active ? "text-[var(--accent-strong)]" : "text-[var(--muted)]"}`}>{item.icon}</span>
                          <span className="min-w-0">
                            <span className="block text-[0.82rem] font-semibold [overflow-wrap:anywhere]">{item.label}</span>
                            {item.helper && <span className="mt-0.5 block text-[10px] leading-3.5 text-[var(--brand-strong)]">{item.helper}</span>}
                          </span>
                          {active && <span aria-hidden="true" className="student-shell-active-edge absolute inset-y-2 start-0 w-0.5 rounded-e-full bg-[var(--accent)]" />}
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

      <div className={`student-shell-content admin-shell-content ${role === "student" ? "lg:ps-[15.5rem]" : "lg:pl-[15.5rem]"}`}>
        {role === "student" ? (
          <>
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 pt-[env(safe-area-inset-top)] shadow-[var(--shadow-sm)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/student" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label={shellHomeAria}>
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
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-bold text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
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
                                className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-[var(--surface)] text-[var(--brand)] shadow-[var(--shadow-xs)]" : "border-transparent bg-[var(--surface)]/80 text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface)]"}`}
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

            <div className="student-shell-desktop-header hidden min-h-[4.5rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-[var(--surface)] px-6 lg:flex xl:px-8">
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
            <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/95 pt-[env(safe-area-inset-top)] shadow-[var(--shadow-sm)] backdrop-blur lg:hidden">
              <div className="flex min-h-16 items-center justify-between gap-3 px-3 py-2.5 min-[360px]:px-4">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center gap-2.5" aria-label={shellHomeAria}>
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
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm font-bold text-[var(--foreground)] shadow-[var(--shadow-xs)] transition-colors hover:border-[var(--brand-border)] hover:text-[var(--brand)] min-[340px]:px-3"
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
                    {currentAdminItems.map((item) => {
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          aria-current={active ? "page" : undefined}
                          className={`flex min-h-14 items-center gap-3 rounded-[var(--radius-control)] border px-3.5 py-2.5 transition-colors ${active ? "border-[var(--brand-border)] bg-[var(--surface)] text-[var(--brand)] shadow-[var(--shadow-xs)]" : "border-transparent bg-[var(--surface)]/80 text-[var(--foreground)] hover:border-[var(--border)] hover:bg-[var(--surface)]"}`}
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

            <div className="admin-shell-topbar hidden min-h-[4.75rem] items-center justify-between gap-6 border-b border-[var(--border)] bg-[var(--surface)]/95 px-6 backdrop-blur lg:flex xl:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--brand)]">{currentItem.label}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {currentItem.helper || "Pilotage opérationnel AlmaGo"}
                </p>
              </div>
              <div className="text-[var(--foreground-soft)]">
                Espace équipe
              </div>
            </div>
          </>
        )}

        <div id="main-content" tabIndex={-1} className="student-shell-main min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
