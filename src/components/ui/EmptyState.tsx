import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function EmptyState({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description: string; action: ReactNode }) {
  return (
    <Card className="border-dashed py-9 text-center shadow-none">
      <div className="mx-auto max-w-xl">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{eyebrow}</p> : null}
        <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--foreground)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        <div className="mt-5 flex justify-center">{action}</div>
      </div>
    </Card>
  );
}
