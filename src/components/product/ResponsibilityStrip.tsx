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
    shell: "bg-[var(--brand-soft)]/55",
  },
  campus: {
    label: "text-[#7b5900]",
    marker: "bg-[var(--accent)]",
    shell: "bg-[#fff9e9]",
  },
  external: {
    label: "text-[#3e4a54]",
    marker: "bg-[#4b5964]",
    shell: "bg-[#f3f5f6]",
  },
  neutral: {
    label: "text-[var(--muted-strong)]",
    marker: "bg-[#8f9498]",
    shell: "bg-[#f7f5f1]",
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
    <section className="overflow-hidden rounded-[1.35rem] border border-black/[.07] bg-white shadow-[0_22px_60px_-42px_rgba(0,0,0,.34)]">
      <div className="flex items-center gap-2 border-b border-black/[.06] px-5 py-4">
        <span className="h-2 w-2 rounded-full bg-[#17191b]" aria-hidden="true" />
        <h2 className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#656a6e]">
          {title}
        </h2>
      </div>
      <div className="grid gap-px bg-black/[.06] sm:grid-cols-3">
        {items.map((item, index) => {
          const tone = toneClass[item.tone ?? "neutral"];
          return (
            <div key={index} className={`min-w-0 px-5 py-5 ${tone.shell}`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${tone.marker}`} aria-hidden="true" />
                <p className={`text-xs font-extrabold ${tone.label}`}>
                  {item.label}
                </p>
              </div>
              <div className="mt-2 text-sm leading-6 text-[#454b4f] [overflow-wrap:anywhere]">
                {item.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
