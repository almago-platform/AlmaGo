import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function StudentPageState({
  title,
  description,
  actions,
  eyebrow,
  variant = "neutral",
  centered = false,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
  variant?: "success" | "info" | "warning" | "error" | "neutral";
  centered?: boolean;
}) {
  return (
    <Card
      className={`shadow-none ${centered ? "border-dashed py-10 text-center" : ""}`}
    >
      <div role={variant === "error" || variant === "warning" ? "alert" : undefined}>
        {eyebrow ? <Badge variant={variant}>{eyebrow}</Badge> : null}
        <h2 className={`${eyebrow ? "mt-3 " : ""}text-xl font-semibold tracking-[-0.02em] text-slate-950`}>
          {title}
        </h2>
        {description ? (
          <p className={`${centered ? "mx-auto " : ""}mt-2 max-w-2xl text-sm leading-6 text-slate-600`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className={`mt-5 flex flex-wrap gap-3 ${centered ? "justify-center" : ""}`}>
          {actions}
        </div>
      ) : null}
    </Card>
  );
}
