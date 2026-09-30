"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { prospectDashboardCopy } from "@/content/prospect-dashboard-copy";
import { createClient } from "@/lib/supabase/client";

export function ProspectShell({
  children,
  displayName,
}: Readonly<{
  children: ReactNode;
  displayName?: string | null;
}>) {
  const router = useRouter();
  const { locale, direction, copy } = useLocale();
  const t = prospectDashboardCopy[locale].shell;
  const name = displayName?.trim();

  const links = [
    { href: "/prospect#orientation", label: t.links.orientation },
    { href: "/prospect#possibilities", label: t.links.possibilities },
    { href: "/prospect#roadmap", label: t.links.roadmap },
    { href: "/prospect#missing", label: t.links.missing },
    { href: "/orientation?mode=update", label: t.links.update },
  ];

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div dir={direction} className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <a href="#main-content" className="skip-link">{copy.shell.skip}</a>

      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/prospect" className="flex min-w-0 items-center gap-3" aria-label={t.homeAria}>
            <BrandLogo className="h-9 w-auto max-w-[11rem]" />
            <span className="hidden rounded-full border border-[var(--brand-border)] bg-[var(--brand-soft)] px-2.5 py-1 text-[11px] font-bold text-[var(--brand-strong)] sm:inline">
              {t.freeBadge}
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
        <aside className="h-fit rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:sticky lg:top-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.area}</p>
          {name ? <p className="mt-2 text-sm font-bold"><bdi dir="auto">{name}</bdi></p> : null}
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{t.intro}</p>

          <nav className="mt-5" aria-label={t.navigation}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[var(--radius-control)] border border-transparent px-3 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--brand-border)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand-strong)]"
                >
                  {item.label}
                </Link>
              ))}
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
