import Link from "next/link";

type CaseAdmission = {
  available: boolean;
  total: number;
  toReview: number;
  accepted: number;
  replace: number;
  canAdd: boolean;
};

type VerifiedDeadline = { label: string; date: string; href: string } | null;

type CaseFollowUp = {
  canExchange: boolean;
  admission: CaseAdmission;
  requestedDocuments: string[];
  documentsToReview: number;
  unreadStudentMessages: number;
  deadline: VerifiedDeadline;
};

function displayDeadlineDate(value: string) {
  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(value)) return value;
  const instant = new Date(value + "T00:00:00Z");
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(instant);
}

function countLabel(count: number, single: string, plural: string) {
  return `${count} ${count === 1 ? single : plural}`;
}

export function AdminDossierQuickHandoff({
  canExchange,
  admission,
  requestedDocuments,
  documentsToReview,
  unreadStudentMessages,
  deadline,
}: CaseFollowUp) {
  const requestedCount = requestedDocuments.length;
  const mainAdmission = !admission.available
    ? "Preuves d’admission momentanément indisponibles"
    : admission.total === 0
      ? "Aucune preuve d’admission liée à une candidature"
      : admission.replace > 0
        ? countLabel(admission.replace, "preuve à remplacer", "preuves à remplacer")
        : admission.toReview > 0
          ? countLabel(admission.toReview, "preuve à vérifier", "preuves à vérifier")
          : countLabel(admission.accepted, "preuve vérifiée", "preuves vérifiées");

  return (
    <section aria-labelledby="quick-handoff-title"
      className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-strong)]">Suivi pratique</p>
          <h2 id="quick-handoff-title" className="mt-1 text-lg font-bold text-slate-950">
            Admission, pièces et prochaines étapes
          </h2>
        </div>
        <p className="text-xs text-slate-600">Informations enregistrées · aucune décision automatique</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <h3 className="text-xs font-semibold text-slate-700">Admission universitaire</h3>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-950">{mainAdmission}</p>
          {admission.available && admission.total > 0 ? (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {admission.total} preuve{admission.total > 1 ? "s" : ""} liée{admission.total > 1 ? "s" : ""} à une candidature
              {admission.accepted > 0 ? ` · ${admission.accepted} preuve(s) vérifiée(s)` : ""}
            </p>
          ) : null}
          <a href="#applications" className="mt-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
            Suivre la candidature →
          </a>
          {admission.canAdd ? (
            <a href="#admission-pdf" className="ml-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
              Ajouter une lettre PDF →
            </a>
          ) : null}
        </div>
        <div className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <h3 className="text-xs font-semibold text-slate-700">Documents demandés</h3>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-950">
            {requestedCount
              ? countLabel(requestedCount, "pièce attendue de l’étudiant", "pièces attendues de l’étudiant")
              : "Aucune pièce actuellement attendue de l’étudiant"}
          </p>
          {requestedCount ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{requestedDocuments.slice(0, 2).join(" · ")}</p>
          ) : null}
          {documentsToReview > 0 ? (
            <p className="mt-1 text-xs font-medium text-slate-700">
              {countLabel(documentsToReview, "document à vérifier par Campus", "documents à vérifier par Campus")}
            </p>
          ) : null}
          <a href="#documents" className="mt-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
            Ouvrir les documents →
          </a>
          {canExchange ? (
            <a href="#request-document" className="ml-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
              Demander ses documents →
            </a>
          ) : null}
        </div>
        <div className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <h3 className="text-xs font-semibold text-slate-700">Messages de l’étudiant</h3>
          <p className="mt-2 text-sm font-bold leading-5 text-slate-950">
            {unreadStudentMessages
              ? countLabel(unreadStudentMessages, "message non lu", "messages non lus")
              : "Aucun message non lu dans les échanges chargés"}
          </p>
          <a href="#messages" className="mt-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
            Voir la conversation →
          </a>
          {canExchange ? (
            <a href="#send-dossier-message" className="ml-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
              Envoyer un PDF à l’étudiant →
            </a>
          ) : null}
        </div>
        <div className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <h3 className="text-xs font-semibold text-slate-700">Deadline universitaire</h3>
          {deadline ? (
            <>
              <p className="mt-2 text-sm font-bold leading-5 text-slate-950">{displayDeadlineDate(deadline.date)}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{deadline.label} · deadline officielle vérifiée</p>
            </>
          ) : (
            <p className="mt-2 text-sm font-bold leading-5 text-slate-950">
              Aucune deadline officielle vérifiée pour une candidature active non soumise
            </p>
          )}
          <Link href={deadline?.href || "#applications"}
            className="mt-3 inline-flex min-h-10 items-center text-xs font-bold text-[var(--brand-strong)] underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2">
            Voir les échéances →
          </Link>
        </div>
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">
        Un PDF envoyé en message reste une pièce jointe privée : il ne valide pas à lui seul
        une admission. Une preuve académique n’est acceptée qu’après vérification du document officiel.
        Les dates de tâches internes ne sont jamais présentées comme des deadlines universitaires.
      </p>
      {!canExchange ? (
        <p className="mt-2 text-xs text-slate-600">Fonction disponible après liaison du compte de la personne : échange direct de pièces et messages.</p>
      ) : null}
    </section>
  );
}
