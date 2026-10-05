"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
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
    <header className="mb-7 sm:mb-8">
      <div
        className="relative overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#17191b] px-5 py-6 text-white shadow-[0_32px_80px_-46px_rgba(0,0,0,.72)] sm:px-7 sm:py-8"
        style={{
          backgroundImage:
            "radial-gradient(circle at 88% 10%, rgba(244,180,0,.15), transparent 18rem), radial-gradient(circle at 5% 115%, rgba(216,6,33,.18), transparent 21rem)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#d80621_0_62%,#f4b400_62%_78%,transparent_78%)]" aria-hidden="true" />
        <div className="absolute -end-14 -top-16 h-44 w-44 rounded-full border border-white/[.05]" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 max-w-4xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(244,180,0,.11)]" aria-hidden="true" />
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.17em] text-white/64">{eyebrow}</p>
            </div>
            <h1 className="mt-3 break-words text-[clamp(2rem,4vw,3.15rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-white">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-white/65 sm:text-[0.96rem] sm:leading-7">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex w-full shrink-0 flex-wrap gap-2 lg:w-auto lg:justify-end [&_a]:shadow-sm [&_button]:shadow-sm">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      <nav
        aria-label={shared.journeyAria}
        className="mt-4 overflow-x-auto rounded-[1.2rem] border border-black/[.07] bg-white p-1.5 shadow-[0_20px_55px_-42px_rgba(0,0,0,.34)]"
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
                      ? "bg-[var(--brand)] text-white shadow-[0_10px_26px_-18px_rgba(216,6,33,.9)]"
                      : "text-[#61666a] hover:bg-[#f5f2ec] hover:text-[#17191b]")
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      "grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold " +
                      (active
                        ? "bg-[var(--accent)] text-[#17191b]"
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
    </header>
  );
}
