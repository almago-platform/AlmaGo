"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { almagoJourneyCopy } from "@/content/almago-journey-copy";
import type { AlmagoJourneyKey, AlmagoJourneyModel, AlmagoJourneyStepModel } from "@/lib/student/almago-journey";
import s from "./AlmagoJourney.module.css";

export function AlmagoJourney({
  model,
  nextAction,
  variant = "full",
}: {
  model: AlmagoJourneyModel;
  nextAction?: { label: string; detail?: string; href: string };
  variant?: "full" | "compact";
}) {
  const { locale, direction } = useLocale();
  const copy = almagoJourneyCopy[locale];
  const focus =
    model.steps.find((step) => step.key === model.currentKey)
    || model.steps.find((step) => step.status === "blocked")
    || model.steps[model.steps.length - 1];
  const blocker = focus.blocker ? blockerLabel(focus.blocker, copy) : null;
  const arrow = direction === "rtl" ? "←" : "→";

  return (
    <section
      aria-labelledby="almago-journey-title"
      className={[s.journey, variant === "compact" ? s.compact : ""].filter(Boolean).join(" ")}
      data-component="almago-journey"
    >
      <div className={s.header}>
        <div className={s.headerCopy}>
          <p className={s.eyebrow}>{copy.eyebrow}</p>
          <h2 id="almago-journey-title" className={s.title}>{copy.title}</h2>
          <p className={s.intro}>{copy.intro}</p>
        </div>
        <div className={s.summary} aria-label={copy.title}>
          <span className={s.summaryItem}>
            <strong>{model.completedCount}/8</strong> {copy.completed}
          </span>
          <span className={s.summaryItem}>
            <strong>{model.remainingTasks}</strong> {copy.remaining}
          </span>
          <span className={s.goal}>{copy.goal}</span>
        </div>
      </div>

      <div className={s.railWrap}>
        <ol className={s.rail}>
          {model.steps.map((step, index) => (
            <JourneyStep
              key={step.key}
              step={step}
              index={index}
              label={copy.steps[step.key]}
              statusLabel={copy.statuses[step.status]}
            />
          ))}
        </ol>
      </div>

      <div className={s.focusPanel}>
        <div>
          <div className={s.focusMeta}>
            <span className={s.focusBadge}>{copy.nextAction}</span>
            {blocker ? <span className={s.blockerBadge}>{copy.blocker}</span> : null}
          </div>
          <h3 className={s.focusTitle}>
            {nextAction?.label || copy.steps[focus.key]}
          </h3>
          <p className={s.focusText}>
            {blocker || nextAction?.detail || copy.statuses[focus.status]}
          </p>
        </div>
        <Link className={s.focusAction} href={nextAction?.href || focus.href}>
          {copy.open} <span aria-hidden="true">{arrow}</span>
        </Link>
      </div>
    </section>
  );
}

function JourneyStep({
  step,
  index,
  label,
  statusLabel,
}: {
  step: AlmagoJourneyStepModel;
  index: number;
  label: string;
  statusLabel: string;
}) {
  const marker = step.status === "completed"
    ? "✓"
    : step.status === "blocked"
      ? "!"
      : String(index + 1);

  return (
    <li className={[s.step, s[step.status]].join(" ")}>
      <Link
        href={step.href}
        className={s.stepLink}
        aria-current={step.status === "current" ? "step" : undefined}
      >
        <span className={s.node} aria-hidden="true">{marker}</span>
        <span className={s.stepText}>
          <span className={s.label}>{label}</span>
          <span className={s.status}>{statusLabel}</span>
        </span>
      </Link>
    </li>
  );
}

function blockerLabel(
  blocker: NonNullable<AlmagoJourneyStepModel["blocker"]>,
  copy: (typeof almagoJourneyCopy)["fr"],
) {
  if (blocker === "documents") return copy.blockerDocuments;
  if (blocker === "applications") return copy.blockerApplications;
  return copy.blockerAdmission;
}
