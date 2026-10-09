import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";

export type AdminCounselorBriefBlocker = {
  title: string;
  reason: string;
  href: string;
  severity: "critical" | "warning" | "info";
};

export type AdminCounselorBriefDeadline = {
  label: string;
  date: string;
  href: string;
};

export function AdminCounselorBrief({
  segment,
  status,
  statusVariant,
  counselor,
  lastContact,
  action,
  blockers,
  nextDeadline,
  lastEvent,
}: {
  segment: string;
  status: string;
  statusVariant: "success" | "info" | "warning" | "error" | "neutral";
  counselor: string | null;
  lastContact: string | null;
  action: { title: string; description: string; href: string | null; waiting: boolean };
  blockers: AdminCounselorBriefBlocker[];
  nextDeadline: AdminCounselorBriefDeadline | null;
  lastEvent: { text: string; date: string } | null;
}) {
  const leadBlocker = blockers[0] || null;

  return (
    <section id="counselor-brief" aria-labelledby="admin-counselor-brief-title" className="pc-panel scroll-mt-24 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--brand)]">Fiche conseiller</p>
          <h2 id="admin-counselor-brief-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">L’essentiel de ce dossier</h2>
        </div>
        <Badge variant="neutral">{segment}</Badge>
      </div>



      <div className="mt-4 grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className={action.waiting
          ? "rounded-[var(--radius-control)] border border-[var(--warning-border)] bg-[var(--warning-soft)] p-4"
          : "rounded-[var(--radius-control)] bg-[var(--premium-ink)] p-4 text-white"}>
          <div className="flex flex-wrap items-center gap-2">
            <p className={action.waiting
              ? "text-xs font-bold uppercase tracking-[0.1em] text-[var(--warning-strong)]"
              : "text-xs font-bold uppercase tracking-[0.1em] text-white/75"}>Action Campus prioritaire</p>
            {action.waiting ? <Badge variant="warning">En attente</Badge> : null}
          </div>
          <h3 className={action.waiting
            ? "mt-2 text-lg font-semibold text-slate-950"
            : "mt-2 text-lg font-semibold text-white"}>{action.title}</h3>
          <p className={action.waiting
            ? "mt-2 text-sm leading-6 text-slate-700"
            : "mt-2 text-sm leading-6 text-white/85"}>{action.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {action.href ? (
              <Link href={action.href} className={buttonClassName("secondary", "min-h-10 px-4 text-sm")}>
                {action.waiting ? "Consulter l’étape" : "Traiter cette action"} →
              </Link>
            ) : (
              <a href="#actions" className={buttonClassName("secondary", "min-h-10 px-4 text-sm")}>
                Consulter les actions →
              </a>
            )}
          </div>
        </div>

        <aside aria-label="Alertes et preuves du dossier" className="min-w-0 rounded-[var(--radius-control)] border border-[var(--border)] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-950">À surveiller</h3>
            <Badge variant={blockers.length ? (leadBlocker?.severity === "critical" ? "error" : "warning") : "success"}>
              {blockers.length ? `${blockers.length} point${blockers.length > 1 ? "s" : ""}` : "Aucun blocage explicite"}
            </Badge>
          </div>
          {leadBlocker ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <p className="text-sm font-bold text-slate-950">{leadBlocker.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">{leadBlocker.reason}</p>
              <a href={leadBlocker.href} className="mt-2 inline-flex text-sm font-semibold text-[var(--brand-strong)] hover:underline">
                Examiner ce point →
              </a>
              {blockers.length > 1 ? (
                <a href="#blockers" className="ms-3 inline-flex text-xs font-bold text-[var(--brand-strong)] hover:underline">
                  Tous les blocages →
                </a>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs leading-5 text-slate-600">Aucun blocage explicite enregistré ou détecté. Ce constat ne garantit pas l’admission ni l’obtention du visa.</p>
          )}
          {nextDeadline ? (
            <div className="mt-3 border-t border-[var(--border)] pt-3">
              <p className="text-xs font-semibold text-slate-600">Date limite vérifiée · candidature</p>
              <p className="mt-1 text-sm font-bold text-slate-950">{nextDeadline.date}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-700">{nextDeadline.label}</p>
              <Link href={nextDeadline.href} className="mt-1 inline-flex text-xs font-bold text-[var(--brand-strong)] hover:underline">Contrôler la source →</Link>
            </div>
          ) : null}
          <div className="mt-3 border-t border-[var(--border)] pt-3">
            <p className="text-xs font-semibold text-slate-600">Dernier événement enregistré</p>
            {lastEvent ? (
              <>
                <p className="mt-1 line-clamp-3 break-words text-sm leading-6 text-slate-800">{lastEvent.text}</p>
                <p className="mt-1 text-xs text-slate-600">{lastEvent.date}</p>
              </>
            ) : <p className="mt-1 text-xs text-slate-600">Aucun événement enregistré dans l’historique.</p>}
            <a href="#history" className="mt-2 inline-flex text-xs font-bold text-[var(--brand-strong)] hover:underline">Voir l’historique →</a>
          </div>
        </aside>
      </div>
      <dl className="mt-3 grid gap-2 sm:grid-cols-3" aria-label="Repères du candidat">
        <div className="min-w-0 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
          <dt className="text-xs font-semibold text-slate-600">Situation enregistrée</dt>
          <dd className="mt-1"><Badge variant={statusVariant}>{status}</Badge></dd>
        </div>
        <div className="min-w-0 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
          <dt className="text-xs font-semibold text-slate-600">Conseiller responsable</dt>
          <dd className="mt-1 break-words text-sm font-bold text-slate-950">{counselor || "Non attribué"}</dd>
          {!counselor ? <dd className="mt-1 text-xs text-slate-600">Le dossier reste visible pour l’équipe.</dd> : null}
          <dd className="mt-1"><a href="#assignment" className="text-xs font-semibold text-[var(--brand-strong)] hover:underline">Gérer l’attribution →</a></dd>
        </div>
        <div className="min-w-0 rounded-[var(--radius-control)] bg-[var(--surface-subtle)] p-3">
          <dt className="text-xs font-semibold text-slate-600">Dernier contact journalisé</dt>
          <dd className="mt-1 text-sm font-bold text-slate-950">{lastContact || "Aucun contact enregistré"}</dd>
          <dd className="mt-1"><a href="#journal" className="text-xs font-semibold text-[var(--brand-strong)] hover:underline">Ouvrir le journal →</a></dd>
        </div>
      </dl>
    </section>
  );
}
