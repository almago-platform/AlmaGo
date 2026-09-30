"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentSharedCopy } from "@/content/student-shared-copy";

type ResourceKey = "language" | "finance";

const resourceLinks = [
  { key: "pathway", href: "/student/pathway" },
  { key: "language", href: "/student/language-courses" },
  { key: "finance", href: "/student/finance-insurance" },
] as const;

export function StudentResourceHeader({
  current,
  title,
  description,
  actions,
}: {
  current: ResourceKey;
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) {
  const { locale } = useLocale();
  const shared = studentSharedCopy[locale];

  return (
    <header className="mb-6 sm:mb-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
            {shared.resourceEyebrow}
          </p>
          <h1 className="editorial-accent mt-1.5 break-words text-[2rem] leading-[1.07] text-[var(--foreground)] sm:text-[2.55rem]">
            {title}
          </h1>
          <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.96rem] sm:leading-7">
            {description}
          </p>
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end">{actions}</div>}
      </div>

      <nav
        aria-label={shared.resourceAria}
        className="mt-5 overflow-x-auto rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-1.5"
      >
        <div className="flex min-w-max items-center gap-1">
          {resourceLinks.map((item, index) => {
            const active = item.key === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-flex min-h-10 items-center rounded-[var(--radius-control)] px-3 py-2 text-xs font-semibold transition-colors " +
                  (active
                    ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-1 ring-[var(--brand-border)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]")
                }
              >
                {shared.resourceLinks[index]}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
