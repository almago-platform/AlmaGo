"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { prospectOffersCopy } from "@/content/prospect-offers-copy";
import { prospectPaymentCopy } from "@/content/prospect-payment-copy";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const iconClass = "h-[18px] w-[18px] shrink-0";

const icons = {
  dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5.5h6v6H4zM14 5.5h6v4h-6zM14 13.5h6v5h-6zM4 15.5h6v3H4z" /></svg>,
  orientation: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="m15.3 8.7-2 4.6-4.6 2 2-4.6 4.6-2Z" /></svg>,
  catalogue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /></svg>,
  proposal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M6 3.5h9l3 3V20H6z" /><path d="M14.5 3.5v4H18M9 11h6M9 15h4" /></svg>,
  roadmap: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M5 18.5c0-3 2-4 4.5-4s4.5-1 4.5-4-2-4-4.5-4" /><circle cx="5" cy="18.5" r="2" /><circle cx="9.5" cy="6.5" r="2" /><circle cx="14" cy="10.5" r="2" /></svg>,
  documents: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M6 3.5h8l4 4V20.5H6z" /><path d="M14 3.5v4.5h4M9 12h6M9 16h5" /></svg>,
  solutions: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M12 3.5v17M3.5 12h17" /><circle cx="12" cy="12" r="8.5" /></svg>,
  offers: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 7.5h16v11H4z" /><path d="M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8v1.7M4 11.5h16" /></svg>,
  payment: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2" /><path d="M3.5 10h17M7 14h3" /></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClass} aria-hidden="true"><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>,
};

export function ProspectShell({
  children,
  displayName,
  showPayment = false,
}: Readonly<{
  children: ReactNode;
  displayName?: string | null;
  showPayment?: boolean;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, direction, copy } = useLocale();
  const t = prospectHubCopy[locale].shell;
  const offersCopy = prospectOffersCopy[locale];
  const paymentCopy = prospectPaymentCopy[locale];
  const name = displayName?.trim();
  const [mobileOpen, setMobileOpen] = useState(false);

  const journeyLinks: NavItem[] = [
    { href: "/prospect", label: t.links.dashboard, icon: icons.dashboard },
    { href: "/prospect/orientation", label: t.links.orientation, icon: icons.orientation },
    { href: "/prospect/catalogue", label: t.links.catalogue, icon: icons.catalogue },
    { href: "/prospect/documents", label: t.links.documents, icon: icons.documents },
    { href: "/prospect/proposal", label: t.links.proposal, icon: icons.proposal },
    { href: "/prospect/roadmap", label: t.links.roadmap, icon: icons.roadmap },
  ];
  const serviceLinks: NavItem[] = [
    { href: "/prospect/solutions", label: t.links.solutions, icon: icons.solutions },
    { href: "/prospect/offers", label: offersCopy.nav || t.links.offers, icon: icons.offers },
    ...(showPayment || pathname.startsWith("/prospect/payment")
      ? [{ href: "/prospect/payment", label: paymentCopy.nav || t.links.payment, icon: icons.payment }]
      : []),
  ];

  const activeFor = (href: string) =>
    href === "/prospect"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navBlock = (mobile = false) => (
    <nav className={mobile ? "p-4" : "p-2.5"} aria-label={t.navigation}>
      <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">
        {t.journeyGroup}
      </p>
      <div className="grid gap-1">
        {journeyLinks.map((item) => {
          const active = activeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => mobile && setMobileOpen(false)}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${active ? "bg-[var(--brand)] text-white shadow-[0_10px_30px_-18px_rgba(216,6,33,.9)]" : "text-white/76 hover:bg-white/[.07] hover:text-white"}`}
            >
              <span className={active ? "text-white" : "text-white/48 transition-colors group-hover:text-[var(--accent)]"}>
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_0_3px_rgba(244,180,0,.16)]" aria-hidden="true" /> : null}
            </Link>
          );
        })}
      </div>

      <div className="mx-3 my-4 h-px bg-white/10" />
      <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/45">
        {t.servicesGroup}
      </p>
      <div className="grid gap-1">
        {serviceLinks.map((item) => {
          const active = activeFor(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => mobile && setMobileOpen(false)}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${active ? "bg-[linear-gradient(135deg,#fff_0%,#fff8df_100%)] text-[#17191b] shadow-lg ring-1 ring-inset ring-[var(--accent)]/25" : "text-white/72 hover:bg-white/[.07] hover:text-white"}`}
            >
              <span className={active ? "text-[var(--brand)]" : "text-white/45 transition-colors group-hover:text-[var(--accent)]"}>
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {active ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] shadow-[0_0_0_3px_rgba(216,6,33,.10)]" aria-hidden="true" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );

  return (
    <div
      dir={direction}
      className="prospect-shell min-h-screen text-[var(--foreground)] [--accent:#f4b400] [--background:#f5f2ea] [--border:#ded8cf] [--border-strong:#bdb4a8] [--brand:#d80621] [--brand-border:#efa6b1] [--brand-soft:#fff0f2] [--brand-strong:#a9041b] [--foreground:#17191b] [--muted:#676c70] [--surface:#fffefa] [--surface-subtle:#f0ece5]"
      style={{
        background:
          "radial-gradient(circle at 88% 2%, rgba(244,180,0,.10), transparent 22rem), radial-gradient(circle at 6% 22%, rgba(216,6,33,.055), transparent 28rem), var(--background)",
      }}
    >
      <a href="#main-content" className="skip-link">{copy.shell.skip}</a>

      <header className="sticky top-0 z-40 border-b border-black/10 bg-[rgba(255,254,250,.94)] shadow-[0_1px_0_rgba(0,0,0,.03)] backdrop-blur-xl">
        <div className="h-[3px] bg-[linear-gradient(90deg,#17191b_0_33%,#d80621_33%_67%,#f4b400_67%)]" aria-hidden="true" />
        <div className="mx-auto flex min-h-[64px] max-w-[100rem] items-center justify-between gap-2 px-3 min-[360px]:gap-3 min-[360px]:px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-white text-[#17191b] shadow-sm transition hover:bg-[#f7f4ee] lg:hidden"
              aria-label={t.navigation}
              aria-expanded={mobileOpen}
              aria-controls="prospect-mobile-menu"
            >
              {icons.menu}
            </button>
            <Link href="/prospect" className="flex min-w-0 items-center gap-3" aria-label={t.homeAria}>
              <BrandLogo className="h-8 w-auto max-w-[8rem] min-[360px]:h-9 min-[360px]:max-w-[10rem] sm:h-10 sm:max-w-[12.5rem]" priority />
              <span className="hidden items-center gap-2 rounded-full bg-[#17191b] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-white md:inline-flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                {t.badge}
              </span>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden sm:block"><LanguageSwitcher compact /></div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 text-sm font-semibold text-[#17191b] shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-black/20 hover:shadow-md"
            >
              <span className="hidden sm:inline">{t.logout}</span>
              <span className="sm:hidden">{icons.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-label={copy.shell.closeMenu}
          />
          <aside id="prospect-mobile-menu" role="dialog" aria-modal="true" aria-label={t.navigation} className="absolute inset-y-0 start-0 w-[min(88vw,22rem)] overflow-y-auto bg-[#17191b] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <BrandLogo className="h-9 w-auto max-w-[11rem] rounded-lg bg-white px-2 py-1" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white/15"
                aria-label={copy.shell.closeMenu}
              >
                {icons.close}
              </button>
            </div>
            <div className="border-b border-white/10 px-4 py-3"><LanguageSwitcher compact /></div>
            {navBlock(true)}
          </aside>
        </div>
      ) : null}

      <div className="mx-auto grid min-h-[calc(100vh-67px)] max-w-[100rem] gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-0 lg:px-0 lg:py-0 xl:grid-cols-[13.25rem_minmax(0,1fr)] 2xl:grid-cols-[13.5rem_minmax(0,1fr)]">
        <aside className="prospect-desktop-rail relative hidden self-stretch overflow-visible border-e border-white/10 bg-[#17191b] text-white lg:block">
          <div className="lg:sticky lg:top-[67px] lg:max-h-[calc(100vh-67px)] lg:overflow-y-auto lg:py-5 [scrollbar-color:rgba(255,255,255,.16)_transparent] [scrollbar-width:thin]">
            <div className="relative overflow-hidden border-b border-white/10 px-4 py-4">
            <div className="absolute -end-9 -top-10 h-24 w-24 rounded-full bg-[var(--brand)]/20 blur-2xl" aria-hidden="true" />
            <div className="absolute end-7 top-5 h-8 w-8 rounded-full bg-[var(--accent)]/15 blur-lg" aria-hidden="true" />
            <p className="relative text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--accent)]">{t.area}</p>
            {name ? (
              <div className="relative mt-3 flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-extrabold text-white ring-1 ring-white/10">
                  {name.slice(0, 1).toLocaleUpperCase(locale)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white"><bdi dir="auto">{name}</bdi></p>
                  <p className="mt-0.5 text-[11px] text-white/50">{t.badge}</p>
                </div>
              </div>
            ) : null}
          </div>
          {navBlock()}
            <div className="mx-3 mb-3 rounded-xl border border-white/10 bg-white/[.045] px-3 py-3 text-[11px] leading-5 text-white/52">
              Campus Allemagne · Votre projet, étape par étape.
            </div>
          </div>
        </aside>

        <div id="main-content" tabIndex={-1} className="min-w-0 scroll-mt-24 lg:px-5 lg:py-6 xl:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
