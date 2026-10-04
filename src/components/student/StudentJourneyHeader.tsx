"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentSharedCopy } from "@/content/student-shared-copy";

type StudentJourneyStep = "project" | "documents" | "orientation" | "checklist" | "applications" | "procedure" | "pathway";

const journeySteps: Array<{ key: StudentJourneyStep; href: string }> = [
  { key: "project", href: "/student/project" },
  { key: "documents", href: "/student/documents" },
  { key: "orientation", href: "/student/orientation" },
  { key: "checklist", href: "/student/checklist" },
  { key: "applications", href: "/student/applications" },
  { key: "procedure", href: "/student/procedure" },
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
    <header className="mb-6 sm:mb-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-4xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{eyebrow}</p>
          <h1 className="editorial-accent mt-1.5 break-words text-[2rem] leading-[1.07] text-[var(--foreground)] sm:text-[2.55rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.96rem] sm:leading-7">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end">{actions}</div>}
      </div>

      <nav
        aria-label={shared.journeyAria}
        className="mt-5 overflow-x-auto rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[0_18px_45px_-42px_rgba(28,33,36,0.45)]"
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
                    "flex min-h-10 items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-xs font-semibold transition-colors " +
                    (active
                      ? "bg-[var(--brand-soft)] text-[var(--brand-strong)] ring-1 ring-[var(--brand-border)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)]")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold " +
                      (active
                        ? "bg-[var(--brand)] text-white"
                        : "border border-[var(--border)] bg-white text-[var(--muted)]")
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
    </header>
  );
}
