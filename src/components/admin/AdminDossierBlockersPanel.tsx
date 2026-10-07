import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";

export type AdminDossierBlocker = {
  id: string;
  kind: string;
  title: string;
  reason: string;
  owner: "student" | "almago" | "external" | "joint";
  severity: "critical" | "warning" | "info";
  href: string;
  actionLabel: string;
};

function ownerLabel(owner: AdminDossierBlocker["owner"]) {
  if (owner === "student") return "Étudiant";
  if (owner === "external") return "Externe";
  if (owner === "joint") return "Campus + étudiant";
  return "Campus Allemagne";
}

function blockerVariant(severity: AdminDossierBlocker["severity"]): "error" | "warning" | "info" {
  if (severity === "critical") return "error";
  if (severity === "warning") return "warning";
  return "info";
}

export function AdminDossierBlockersPanel({
  blockers,
}: {
  blockers: AdminDossierBlocker[];
}) {
  return (
    <section className="pc-panel p-5 sm:p-6" aria-labelledby="dossier-blockers-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Blocages du dossier</p>
          <h2 id="dossier-blockers-title" className="mt-2 text-xl font-semibold tracking-[-0.025em] text-slate-950">
            Ce qui empêche ou ralentit la suite
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Chaque blocage indique qui doit agir, pourquoi la suite est ralentie et l’écran à ouvrir pour le résoudre. Une attente normale n’est pas inventée comme blocage.
          </p>
        </div>
        <Badge variant={blockers.length ? "warning" : "success"}>
          {blockers.length
            ? `${blockers.length} blocage${blockers.length > 1 ? "s" : ""}`
            : "Aucun blocage explicite"}
        </Badge>
      </div>

      {blockers.length ? (
        <div className="mt-5 divide-y divide-[var(--border)] rounded-[var(--radius-control)] border border-[var(--border)] bg-white">
          {blockers.map((blocker) => (
            <article
              key={blocker.id}
              className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_11rem_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={blockerVariant(blocker.severity)}>{blocker.kind}</Badge>
                  <Badge variant="neutral">{ownerLabel(blocker.owner)}</Badge>
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-950">{blocker.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{blocker.reason}</p>
              </div>

              <div>
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-slate-600">Responsable</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{ownerLabel(blocker.owner)}</p>
              </div>

              <Link
                href={blocker.href}
                className={buttonClassName(
                  blocker.severity === "critical" ? "primary" : "secondary",
                  "min-h-9 px-3 py-1.5 text-xs",
                )}
              >
                {blocker.actionLabel}
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[var(--radius-control)] border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-950">Aucun blocage explicite détecté.</p>
          <p className="mt-1 text-sm leading-5 text-emerald-900">
            Le dossier peut continuer selon sa prochaine action enregistrée. Les attentes externes normales restent suivies dans les étapes et candidatures.
          </p>
        </div>
      )}
    </section>
  );
}
