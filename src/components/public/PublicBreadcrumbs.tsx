import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PublicBreadcrumbs({ items }: Readonly<{ items: readonly BreadcrumbItem[] }>) {
  return (
    <nav
      aria-label="Fil d’Ariane"
      className="border-b border-[var(--border)] bg-white"
    >
      <div className="mx-auto flex min-h-11 max-w-7xl items-center gap-2 overflow-x-auto px-4 text-xs font-semibold text-slate-500 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 transition-colors hover:text-[var(--brand)]">
          Accueil
        </Link>
        {items.map((item, index) => (
          <span key={item.label} className="flex shrink-0 items-center gap-2">
            <span aria-hidden="true" className="text-slate-300">/</span>
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="transition-colors hover:text-[var(--brand)]">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-slate-700">
                {item.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
