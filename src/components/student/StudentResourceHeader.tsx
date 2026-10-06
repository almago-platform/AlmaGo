"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { DossierHeader } from "@/components/product/DossierHeader";
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
    <div className="mb-7 sm:mb-8">
      <DossierHeader
        eyebrow={shared.resourceEyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <nav
        aria-label={shared.resourceAria}
        className="mt-4 overflow-x-auto rounded-[1.2rem] border border-black/[.07] bg-white p-1.5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.34)]"
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
                    ? "bg-[var(--brand)] text-white shadow-[0_10px_26px_-18px_rgba(216,6,33,.9)]"
                    : "text-[#61666a] hover:bg-[#f5f2ec] hover:text-[#17191b]")
                }
              >
                {shared.resourceLinks[index]}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
