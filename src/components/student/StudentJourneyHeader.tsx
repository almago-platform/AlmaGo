"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { DossierHeader } from "@/components/product/DossierHeader";
import { studentSharedCopy } from "@/content/student-shared-copy";

type StudentJourneyStep = "project" | "documents" | "orientation" | "checklist" | "applications" | "pathway";

const journeySteps: Array<{ key: StudentJourneyStep; href: string }> = [
  { key: "project", href: "/student/project" },
  { key: "documents", href: "/student/documents" },
  { key: "orientation", href: "/student/orientation" },
  { key: "checklist", href: "/student/procedure" },
  { key: "applications", href: "/student/applications" },
  { key: "pathway", href: "/student/pathway" },
];

export function StudentJourneyHeader({
  current,
  eyebrow,
  title,
  description,
  actions,
}: {
  current: StudentJourneyStep;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  const { locale } = useLocale();
  const shared = studentSharedCopy[locale];

  return (
    <div className="mb-7 sm:mb-8">
      <DossierHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <nav
        aria-label={shared.journeyAria}
        className="pc-panel mt-3 overflow-x-auto p-1.5"
      >
        <ol className="flex min-w-max items-center gap-1">
          {journeySteps.map((step, index) => {
            const active = step.key === current;
            return (
              <li key={step.key}>
                <Link
                  href={step.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 " +
                    (active
                      ? "bg-[var(--brand)] text-white shadow-[var(--premium-shadow-brand)]"
                      : "text-[#61666a] hover:bg-[var(--premium-cream)] hover:text-[var(--premium-ink)]")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold " +
                      (active
                        ? "bg-[var(--accent)] text-[var(--premium-ink)]"
                        : "border border-black/10 bg-white text-[#73797d]")
                    }
                  >
                    {index + 1}
                  </span>
                  <span>{shared.journeySteps[index]}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
