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
    <header className="mb-7 sm:mb-8">
      <div className="pc-hero px-5 py-5 sm:px-7 sm:py-6">
        <div className="pc-hero-orbit" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <p className="pc-kicker pc-kicker-inverse">{shared.resourceEyebrow}</p>
            <h1 className="mt-2.5 break-words text-[clamp(1.9rem,3.5vw,3rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-white">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-[0.95rem]">
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end [&_a]:shadow-sm [&_button]:shadow-sm">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      <nav
        aria-label={shared.resourceAria}
        className="pc-panel mt-3 overflow-x-auto p-1.5"
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
                  "inline-flex min-h-10 items-center rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 " +
                  (active
                    ? "bg-[var(--brand)] text-white shadow-[var(--premium-shadow-brand)]"
                    : "text-[#61666a] hover:bg-[var(--premium-cream)] hover:text-[var(--premium-ink)]")
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
