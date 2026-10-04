"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { prospectOffersCopy } from "@/content/prospect-offers-copy";
import { prospectPaymentCopy } from "@/content/prospect-payment-copy";
import { createClient } from "@/lib/supabase/client";

export function ProspectShell({
  children,
  displayName,
}: Readonly<{
  children: ReactNode;
  displayName?: string | null;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, direction, copy } = useLocale();
  const t = prospectHubCopy[locale].shell;
  const offersCopy = prospectOffersCopy[locale];
  const paymentCopy = prospectPaymentCopy[locale];
  const name = displayName?.trim();

  const journeyLinks = [
    { href: "/prospect", label: t.links.dashboard },
    { href: "/prospect/orientation", label: t.links.orientation },
    { href: "/prospect/catalogue", label: t.links.catalogue },
    { href: "/prospect/proposal", label: t.links.proposal },
    { href: "/prospect/roadmap", label: t.links.roadmap },
    { href: "/prospect/documents", label: t.links.documents },
  ];
  const serviceLinks = [
    { href: "/prospect/solutions", label: t.links.solutions },
    { href: "/prospect/offers", label: offersCopy.nav || t.links.offers },
    { href: "/prospect/payment", label: paymentCopy.nav || t.links.payment },
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

  return (
    <div dir={direction} className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a href="#main-content" className="skip-link">{copy.shell.skip}</a>

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:rgba(255,253,248,0.94)] backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/prospect" className="flex min-w-0 items-center gap-3" aria-label={t.homeAria}>
            <BrandLogo className="h-9 w-auto max-w-[11rem]" />
            <span className="hidden rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-strong)] sm:inline">
              {t.badge}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-10 items-center rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--brand-border)]"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-[15rem_minmax(0,1fr)] lg:px-8 lg:py-9">
        <aside className="h-fit overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <div className="border-b border-[var(--border)] bg-[linear-gradient(145deg,var(--surface),var(--surface-subtle))] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.area}</p>
            {name ? <p className="mt-2 text-sm font-bold"><bdi dir="auto">{name}</bdi></p> : null}
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{t.intro}</p>
          </div>

          <nav className="p-3" aria-label={t.navigation}>
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {t.journeyGroup}
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {journeyLinks.map((item) => {
                const active = activeFor(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-[var(--radius-control)] border px-3 py-2.5 text-sm font-semibold transition-all ${active ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-[inset_3px_0_0_var(--brand)]" : "border-transparent text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="my-3 border-t border-[var(--border)]" />
            <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
              {t.servicesGroup}
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
              {serviceLinks.map((item) => {
                const active = activeFor(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-[var(--radius-control)] border px-3 py-2.5 text-sm font-semibold transition-all ${active ? "border-[var(--brand-border)] bg-[var(--brand-soft)] text-[var(--brand-strong)] shadow-[inset_3px_0_0_var(--brand)]" : "border-transparent text-[var(--foreground)] hover:bg-[var(--surface-subtle)]"}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        <div id="main-content" tabIndex={-1} className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
