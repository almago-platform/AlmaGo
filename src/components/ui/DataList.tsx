import type { ReactNode } from "react";

export type DataListItem = {
  label: ReactNode;
  value: ReactNode;
};

export function DataList({
  items,
  className = "",
}: {
  items: DataListItem[];
  className?: string;
}) {
  return (
    <dl className={`divide-y divide-[var(--border)] border-y border-[var(--border)] ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="grid gap-1 py-3 sm:grid-cols-[minmax(8rem,0.38fr)_minmax(0,1fr)] sm:gap-5"
        >
          <dt className="text-xs font-semibold leading-5 text-[var(--muted)]">
            {item.label}
          </dt>
          <dd className="m-0 min-w-0 text-sm font-semibold leading-6 text-[var(--foreground)] [overflow-wrap:anywhere]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
