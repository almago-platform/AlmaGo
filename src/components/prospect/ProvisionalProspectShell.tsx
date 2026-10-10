import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { provisionalCopy } from "@/content/prospect-provisional-copy";
import type { Locale } from "@/lib/i18n";

const shellCopy = {
  fr: {
    navigation: "Navigation de mon espace",
    dashboard: "Tableau de bord",
    area: "MON ESPACE CAMPUS ALLEMAGNE",
    access: "ACCÈS GRATUIT",
    pending: "E-mail à confirmer",
    restricted: "Disponible après confirmation",
    documents: "Mes documents",
    messages: "Messages",
    proposal: "Ma proposition",
    verification: "Activer mon compte",
    skip: "Aller au contenu principal",
  },
  ar: {
    navigation: "التنقل داخل مساحتي",
    dashboard: "لوحة التحكم",
    area: "مساحتي في Campus Allemagne",
    access: "وصول مجاني",
    pending: "البريد غير مؤكد",
    restricted: "متاح بعد التأكيد",
    documents: "وثائقي",
    messages: "الرسائل",
    proposal: "عرضي",
    verification: "تفعيل حسابي",
    skip: "الانتقال إلى المحتوى الرئيسي",
  },
  en: {
    navigation: "My space navigation",
    dashboard: "Dashboard",
    area: "MY CAMPUS ALLEMAGNE SPACE",
    access: "FREE ACCESS",
    pending: "Email confirmation pending",
    restricted: "Available after confirmation",
    documents: "My documents",
    messages: "Messages",
    proposal: "My proposal",
    verification: "Activate my account",
    skip: "Skip to main content",
  },
  de: {
    navigation: "Navigation meines Bereichs",
    dashboard: "Übersicht",
    area: "MEIN CAMPUS ALLEMAGNE BEREICH",
    access: "KOSTENLOSER ZUGANG",
    pending: "E-Mail noch nicht bestätigt",
    restricted: "Nach Bestätigung verfügbar",
    documents: "Meine Dokumente",
    messages: "Nachrichten",
    proposal: "Mein Angebot",
    verification: "Konto aktivieren",
    skip: "Zum Hauptinhalt springen",
  },
} as const satisfies Record<Locale, Record<string, string>>;

/**
 * The same visual navigation pattern as the authenticated Prospect dashboard,
 * but with strictly public, read-only anchor links. Never mount ProspectShell
 * here: its authenticated routes, logout action and permissions are not valid
 * for an unconfirmed account.
 */
export function ProvisionalProspectShell({
  locale,
  children,
}: Readonly<{ locale: Locale; children: ReactNode }>) {
  const t = provisionalCopy[locale];
  const s = shellCopy[locale];
  const navLinks = [
    { href: "#overview", label: s.dashboard },
    { href: "#orientation", label: t.orientation },
    { href: "#programmes", label: t.programmes },
    { href: "#steps", label: t.steps },
    { href: "#verification", label: s.verification },
  ];
  const protectedLabels = [s.documents, s.messages, s.proposal];

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f5f2ea] text-[#17191b] [--accent:#f4b400] [--background:#f5f2ea] [--border:#ded8cf] [--border-strong:#bdb4a8] [--brand:#d80621] [--brand-border:#efa6b1] [--brand-soft:#fff0f2] [--brand-strong:#a9041b] [--foreground:#17191b] [--muted:#676c70] [--surface:#fffefa] [--surface-subtle:#f0ece5]"
    >
      <a href="#main-content" className="skip-link">{s.skip}</a>
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fffefa]/95 backdrop-blur-lg">
        <div className="h-[3px] bg-[linear-gradient(90deg,#17191b_0_33%,#d80621_33%_67%,#f4b400_67%)]" aria-hidden="true" />
        <div className="mx-auto flex min-h-[64px] max-w-[100rem] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 min-w-0 items-center gap-3">
            <BrandLogo className="h-9 w-auto max-w-[11rem] sm:h-10 sm:max-w-[12.5rem]" priority />
            <span className="hidden items-center gap-2 rounded-full bg-[#17191b] px-3 py-1.5 text-[10px] font-extrabold tracking-wide text-white md:inline-flex">
              <span className="size-1.5 rounded-full bg-[#f4b400]" aria-hidden="true" />
              {s.access}
            </span>
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center rounded-xl border border-[#ded8cf] bg-white px-3 py-2 text-xs font-semibold text-[#17191b] hover:border-[#d80621] sm:text-sm">
            {t.login}
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-67px)] max-w-[100rem] lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <aside className="hidden bg-[#17191b] text-white lg:block">
          <nav className="sticky top-[67px] max-h-[calc(100vh-67px)] overflow-y-auto px-2.5 py-6" aria-label={s.navigation}>
            <p className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#f4b400]">{s.area}</p>
            <div className="grid gap-1">
              {navLinks.map((item, index) => (
                <a key={item.href} href={item.href} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition hover:bg-white/10 ${index === 0 ? "bg-[#d80621] text-white" : "text-white/80"}`}>
                  <span className="text-[#f4b400]" aria-hidden="true">{index === 0 ? "◉" : "›"}</span>
                  {item.label}
                </a>
              ))}
            </div>
            <div className="mx-3 my-4 h-px bg-white/15" />
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-white/50">{s.restricted}</p>
            <div className="grid gap-1">
              {protectedLabels.map((label) => (
                <span key={label} aria-disabled="true" className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/45">
                  <span aria-hidden="true">🔒</span>{label}
                </span>
              ))}
            </div>
          </nav>
        </aside>

        <div className="min-w-0 px-4 py-5 sm:px-6 lg:px-6 lg:py-7">
          <nav aria-label={s.navigation} className="mb-5 flex gap-2 overflow-x-auto pb-2 lg:hidden">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="inline-flex min-h-11 shrink-0 items-center rounded-xl border border-[#ded8cf] bg-white px-3 text-xs font-semibold text-[#17191b]">
                {item.label}
              </a>
            ))}
          </nav>
          <main id="main-content" tabIndex={-1} className="mx-auto max-w-[88rem] scroll-mt-24 space-y-5">
            {children}
          </main>
          <p className="mx-auto mt-7 max-w-[88rem] text-center text-xs leading-6 text-[#676c70]">{s.pending} · {t.notice}</p>
        </div>
      </div>
    </div>
  );
}
