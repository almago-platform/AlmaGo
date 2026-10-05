import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type ProgrammeTone = "compatible" | "review" | "neutral" | "blocked";

const toneConfig = {
  compatible: { label: "Profil compatible", variant: "success" as const },
  review: { label: "À vérifier", variant: "warning" as const },
  neutral: { label: "À explorer", variant: "neutral" as const },
  blocked: { label: "Condition bloquante", variant: "error" as const },
};

export function ProgrammeCard({
  title,
  institution,
  location,
  degree,
  language,
  intake,
  tone = "neutral",
  statusLabel,
  explanation,
  href,
  actionLabel = "Voir le programme",
  footer,
}: {
  title: ReactNode;
  institution: ReactNode;
  location?: ReactNode;
  degree?: ReactNode;
  language?: ReactNode;
  intake?: ReactNode;
  tone?: ProgrammeTone;
  statusLabel?: ReactNode;
  explanation?: ReactNode;
  href?: string;
  actionLabel?: ReactNode;
  footer?: ReactNode;
}) {
  const status = toneConfig[tone];
  const facts = [degree, location, language, intake].filter(Boolean);

  return (
    <article className="flex h-full flex-col rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={status.variant}>{statusLabel ?? status.label}</Badge>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-6 tracking-[-0.02em] text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mt-1 text-sm font-semibold leading-6 text-[var(--foreground-soft)]">{institution}</p>
      {facts.length ? (
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5 text-[var(--muted)]">
          {facts.map((fact, index) => (
            <li key={index}>{fact}</li>
          ))}
        </ul>
      ) : null}
      {explanation ? (
        <div className="mt-4 text-sm leading-6 text-[var(--foreground-soft)]">{explanation}</div>
      ) : null}
      <div className="mt-auto pt-5">
        {href ? (
          <Link href={href} className="text-sm font-semibold text-[var(--brand-strong)] hover:underline">
            {actionLabel} →
          </Link>
        ) : null}
        {footer ? <div className="mt-3 border-t border-[var(--border)] pt-3">{footer}</div> : null}
      </div>
    </article>
  );
}
