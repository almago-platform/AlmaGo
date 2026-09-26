import Link from "next/link";

const items = [
  {
    href: "#parcours",
    title: "Mon parcours",
    text: "Comprendre les 6 étapes",
    icon: "route",
    primary: false,
  },
  {
    href: "#espace",
    title: "Espace étudiant",
    text: "Voir le dossier AlmaGo",
    icon: "dashboard",
    primary: false,
  },
  {
    href: "#confiance",
    title: "Sources & confiance",
    text: "Comprendre ce qui est vérifié",
    icon: "source",
    primary: false,
  },
  {
    href: "#faq",
    title: "Questions fréquentes",
    text: "Trouver une réponse rapidement",
    icon: "faq",
    primary: false,
  },
  {
    href: "/signup",
    title: "Créer mon dossier",
    text: "Commencer maintenant",
    icon: "start",
    primary: true,
  },
] as const;

export function HomeQuickAccess() {
  return (
    <section className="border-b border-[var(--border)] bg-white" aria-labelledby="quick-access-title">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-11 lg:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Accès rapide</p>
            <h2 id="quick-access-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
              Aller directement à ce qui vous aide.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-500">
            Parcours, dossier, sources et réponses essentielles : choisissez votre point d’entrée.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative min-h-[10.5rem] overflow-hidden rounded-[var(--radius-panel)] border p-5 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 ${
                item.primary
                  ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                  : "border-[var(--border)] bg-[var(--surface-subtle)] text-slate-950 hover:border-[var(--brand-border)] hover:bg-white"
              }`}
            >
              <span
                className={`grid h-12 w-12 place-items-center rounded-full border ${
                  item.primary
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-[var(--brand-border)] bg-white text-[var(--brand)]"
                }`}
                aria-hidden="true"
              >
                <QuickIcon name={item.icon} />
              </span>

              <h3 className="mt-5 text-base font-bold">{item.title}</h3>
              <p className={`mt-1 text-sm leading-5 ${item.primary ? "text-white/75" : "text-slate-500"}`}>
                {item.text}
              </p>

              <span
                aria-hidden="true"
                className={`absolute bottom-4 right-4 text-lg font-bold transition-transform group-hover:translate-x-1 ${
                  item.primary ? "text-white" : "text-[var(--accent-strong)]"
                }`}
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuickIcon({ name }: { name: (typeof items)[number]["icon"] }) {
  const common = "h-6 w-6";
  if (name === "route") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <circle cx="6" cy="6" r="2.2" />
        <circle cx="18" cy="18" r="2.2" />
        <path d="M8.2 6h4.3a3 3 0 0 1 3 3v.8a3 3 0 0 1-3 3H10a3 3 0 0 0-3 3V16" />
      </svg>
    );
  }

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    );
  }

  if (name === "source") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <path d="M7 3.5h7l3 3V20a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 7 20V4Z" />
        <path d="M14 3.5V7h3.5M9.5 11.5h5M9.5 15h5" />
      </svg>
    );
  }

  if (name === "faq") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
        <path d="M5 5.5h14v10H9l-4 3v-13Z" />
        <path d="M9.5 9a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.1M12 15.8h.01" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
      <path d="M12 4v16M4 12h16" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}
