import type { ReactNode } from "react";

export function PremiumSectionHeader({
  eyebrow,
  title,
  description,
  actions,
  align = "end",
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  align?: "start" | "center" | "end";
}) {
  const alignment =
    align === "center"
      ? "items-center text-center"
      : align === "start"
        ? "items-start"
        : "items-end";

  return (
    <div className={"flex flex-col gap-3 sm:flex-row sm:justify-between " + alignment}>
      <div className={align === "center" ? "max-w-3xl" : "min-w-0 max-w-4xl"}>
        {eyebrow ? <div className="pc-kicker">{eyebrow}</div> : null}
        <h2 className="mt-2 text-[clamp(1.45rem,2.6vw,2.05rem)] font-semibold leading-[1.12] tracking-[-0.04em] text-[var(--foreground)]">
          {title}
        </h2>
        {description ? (
          <div className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] sm:text-[0.95rem]">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
