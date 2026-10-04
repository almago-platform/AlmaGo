import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

type Tone = "success" | "warning" | "error" | "info" | "neutral";

const toneClass: Record<Tone, string> = {
  success: "border-[var(--success-border)] bg-[var(--success-soft)]",
  warning: "border-[var(--warning-border)] bg-[var(--warning-soft)]",
  error: "border-[var(--danger-border)] bg-[var(--danger-soft)]",
  info: "border-[var(--info-border)] bg-[var(--info-soft)]",
  neutral: "border-[var(--border)] bg-[var(--surface)]",
};

export function StatusState({ tone = "neutral", eyebrow, title, description, reassurance, action }: { tone?: Tone; eyebrow?: string; title: string; description: string; reassurance?: string; action?: ReactNode }) {
  return (
    <Card className={`shadow-none ${toneClass[tone]}`}>
      <div role={tone === "error" ? "alert" : "status"}>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground-soft)]">{eyebrow}</p> : null}
        <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--foreground-soft)]">{description}</p>
        {reassurance ? <p className="mt-2 text-xs leading-5 text-[var(--muted)]">{reassurance}</p> : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </Card>
  );
}
