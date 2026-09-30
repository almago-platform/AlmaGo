"use client";


import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { studentSharedCopy } from "@/content/student-shared-copy";


export type StudentJourneyStage = {
  label: string;
  detail: string;
  href?: string;
  tone?: "done" | "active" | "neutral";
};


export function StudentJourneyOverview({
  stages,
  showProgressSummary = true,
}: {
  stages: StudentJourneyStage[];
  showProgressSummary?: boolean;
}) {
  const { locale, direction } = useLocale();
  const copy = studentSharedCopy[locale].overview;
  const totalStages = stages.length;
  const completedStages = stages.filter((stage) => stage.tone === "done");
  const activeStage = stages.find((stage) => stage.tone === "active");
  const progressPercent = totalStages > 0 ? Math.round((completedStages.length / totalStages) * 100) : 0;
  const openArrow = direction === "rtl" ? "←" : "→";


  return (
    <section aria-labelledby="student-journey-title" className="mt-7 overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[var(--surface)] shadow-[0_24px_64px_-54px_rgba(28,33,36,0.45)]">
      <div className={`grid gap-5 border-b border-[var(--border)] bg-[var(--surface-subtle)] px-5 py-5 sm:px-6 ${showProgressSummary ? "lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end" : ""}`}>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[var(--brand-strong)]">{copy.eyebrow}</p>
          <h2 id="student-journey-title" className="editorial-accent mt-2 text-[1.7rem] leading-[1.08] text-[var(--foreground)] sm:text-[2rem]">
            {copy.title}
          </h2>
