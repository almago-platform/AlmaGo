import type { ReactNode } from "react";

export type ResponsibilityItem = {
  label: ReactNode;
  detail: ReactNode;
  tone?: "user" | "campus" | "external" | "neutral";
};

const toneClass = {
  user: "text-[var(--brand-strong)]",
  campus: "text-[var(--success-strong)]",
  external: "text-[var(--info-strong)]",
  neutral: "text-[var(--muted-strong)]",
} as const;

export function ResponsibilityStrip({
  items,
  title = "Responsabilité actuelle",
}: {
  items: ResponsibilityItem[];
  title?: ReactNode;
}) {
  return (
    <section aria-labelledby="responsibility-strip-title" className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
        <h2 id="responsibility-strip-title" className="text-xs font-bold uppercase tracking-[0.13em] text-[var(--muted)]">
          {title}
        </h2>
      </div>
      <div className="grid divide-y divide-[var(--border)] sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:divide-x-[var(--border)]">
        {items.map((item, index) => (
          <div key={index} className="min-w-0 px-4 py-4 sm:px-5">
            <p className={`text-xs font-bold ${toneClass[item.tone ?? "neutral"]}`}>
              {item.label}
            </p>
            <div className="mt-1 text-sm leading-6 text-[var(--foreground-soft)] [overflow-wrap:anywhere]">
              {item.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
