import Link from "next/link";

type QuickStep = {
  number: string;
  title: string;
  detail: string;
  href: string;
  cta: string;
};

const steps: QuickStep[] = [
  {
    number: "1",
    title: "Envoyer un PDF à l’étudiant",
    detail: "Transmettez la lettre reçue dans sa conversation privée.",
    href: "#send-dossier-message",
    cta: "Joindre le PDF",
  },
  {
    number: "2",
    title: "Demander ses documents",
    detail: "Précisez la pièce attendue. L’étudiant la dépose dans Mes documents.",
    href: "#request-document",
    cta: "Demander une pièce",
  },
  {
    number: "3",
    title: "Suivre la candidature",
    detail: "Vérifiez le statut et les échéances avec leurs preuves.",
    href: "#applications",
    cta: "Voir le suivi",
  },
];

export function AdminDossierQuickHandoff({ canExchange }: { canExchange: boolean }) {
  return (
    <section
      aria-labelledby="quick-handoff-title"
      className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="quick-handoff-title" className="text-lg font-semibold tracking-tight text-slate-950">
          Échanger avec cette personne
        </h2>
        <p className="text-xs font-medium text-slate-600">3 accès directs · aucune nouvelle procédure à créer</p>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-3">
        {steps.map((step) => (
          <div key={step.number} className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[var(--brand-strong)]">
                {step.number}
              </span>
              <h3 className="text-sm font-bold leading-5 text-slate-950">{step.title}</h3>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-700">{step.detail}</p>
            {step.number !== "1" || canExchange ? (
              <a
                href={step.href}
                className="mt-2 inline-flex min-h-10 items-center rounded-[var(--radius-control)] px-1 py-2 text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
              >
                {step.cta} →
              </a>
            ) : (
              <p className="mt-2 text-xs font-semibold text-slate-600">
                Messagerie disponible après création du compte lié.
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">
        Un PDF envoyé en message reste une pièce jointe privée : il ne valide pas à lui seul
        une admission. L’état officiel de la candidature et ses preuves se vérifient séparément.
      </p>
      <p className="mt-2 text-xs text-slate-600">
        L’étudiant retrouvera vos pièces jointes dans{" "}
        <Link href="/student/messages" className="font-semibold text-[var(--brand-strong)] underline underline-offset-2">
          son espace Messages
        </Link>
        {" "}et déposera les documents demandés depuis son propre espace Documents.
      </p>
    </section>
  );
}
