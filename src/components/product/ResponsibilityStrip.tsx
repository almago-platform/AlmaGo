import type { ReactNode } from "react";

export type ResponsibilityItem = {
  label: ReactNode;
  detail: ReactNode;
  tone?: "user" | "campus" | "external" | "neutral";
};

const toneClass = {
  user: {
    label: "text-[var(--brand-strong)]",
    marker: "bg-[var(--brand)]",
    shell: "bg-[var(--premium-cream-soft)]",
  },
  campus: {
    label: "text-[var(--warning-strong)]",
    marker: "bg-[var(--accent)]",
    shell: "bg-[var(--premium-gold-wash)]",
  },
  external: {
    label: "text-[var(--foreground-soft)]",
    marker: "bg-[#4b5964]",
    shell: "bg-[var(--premium-blue-wash)]",
  },
  neutral: {
    label: "text-[var(--muted-strong)]",
    marker: "bg-[#8f9498]",
    shell: "bg-[var(--premium-cream-soft)]",
  },
} as const;

export function ResponsibilityStrip({
  items,
  title = "Responsabilité actuelle",
}: {
  items: ResponsibilityItem[];
  title?: ReactNode;
}) {
  return (
    <section className="pc-panel overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--premium-border)] px-4 py-3.5">
        <span className="h-2 w-2 rounded-full bg-[var(--premium-ink)]" aria-hidden="true" />
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[var(--muted)]">
          {title}
        </h2>
      </div>
      <div className="grid gap-px bg-[var(--premium-border)] sm:grid-cols-3">
        {items.map((item, index) => {
          const tone = toneClass[item.tone ?? "neutral"];
          return (
            <div key={index} className={`min-w-0 px-4 py-4 ${tone.shell}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${tone.marker}`} aria-hidden="true" />
                <p className={`text-xs font-extrabold ${tone.label}`}>
                  {item.label}
                </p>
              </div>
              <div className="mt-2 text-sm leading-6 text-[var(--foreground-soft)] [overflow-wrap:anywhere]">
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
