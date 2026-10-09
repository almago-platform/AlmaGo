import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { Badge } from "@/components/ui/Badge";
import { buttonClassName } from "@/components/ui/Button";
import { getAdminUser } from "@/lib/auth/access";

export const dynamic = "force-dynamic";

type Queue = {
  key: string;
  label: string;
  help: string;
  href: string;
  count: number | null;
  countCaption: string;
  actionLabel: string;
  kind: "inbox" | "documents" | "applications" | "deadlines";
};

export default async function AdminProcessingCenterPage({
  searchParams,
}: {
  searchParams: Promise<{ file?: string }>;
}) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user || !isAdmin) {
    return <main className="mx-auto max-w-[88rem] px-4 py-6"><AdminLoadError title="Accès réservé" description="Une session admin confirmée est nécessaire." retryHref="/admin" /></main>;
  }
  const { file } = await searchParams;
  const selected = ["inbox", "documents", "applications", "deadlines"].includes(file || "") ? file || "inbox" : "inbox";

  // Only count records available under the authenticated admin's existing RLS.
  // A query failure is never rendered as a misleading zero.
  const [inbox, documents, applications] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true })
      .eq("user_id", user.id).is("read_at", null),
    supabase.from("documents").select("id", { count: "exact", head: true })
      .in("status", ["pending", "reviewed"]),
    supabase.from("applications").select("id", { count: "exact", head: true }),
  ]);

  const queues: Queue[] = [
    {
      key: "inbox", label: "Messages et événements", help: "Réponses étudiantes, paiements et événements non lus",
      href: "/admin/inbox", count: inbox.error ? null : inbox.count, countCaption: "non lues", actionLabel: "Lire les notifications", kind: "inbox",
    },
    {
      key: "documents", label: "Documents", help: "Versions à vérifier et décisions documentaires",
      href: "/admin/documents", count: documents.error ? null : documents.count, countCaption: "à vérifier", actionLabel: "Vérifier les documents", kind: "documents",
    },
    {
      key: "applications", label: "Candidatures", help: "Enregistrements à consulter, statuts et dates à contrôler",
      href: "/admin/applications", count: applications.error ? null : applications.count, countCaption: "au total", actionLabel: "Examiner les candidatures", kind: "applications",
    },
    {
      key: "deadlines", label: "Échéances", help: "Dates officielles vérifiées et cibles internes distinctes",
      href: "/admin/people?work=official_7", count: null, countCaption: "à consulter", actionLabel: "Voir les dates vérifiées", kind: "deadlines",
    },
  ];
  const active = queues.find((item) => item.key === selected) || queues[0];

  return (
    <main className="mx-auto w-full max-w-[92rem] space-y-5 px-4 py-6 sm:px-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Tâches à traiter"
        description="Retrouvez les notifications, documents, candidatures et dates à contrôler. L’ouverture d’une file ne termine aucune action."
        actions={<Link href="/admin/people" className={buttonClassName("secondary", "px-4")}>Retrouver un dossier</Link>}
      />

      <nav aria-label="Choisir une file de traitement" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {queues.map((item) => (
          <Link key={item.key} href={`/admin/traitement?file=${item.key}`}
            aria-current={selected === item.key ? "page" : undefined}
            className={`min-w-0 rounded-xl border bg-white p-4 transition-colors hover:border-[var(--brand-border)] ${selected === item.key ? "border-[var(--brand)] shadow-sm" : "border-[var(--border)]"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-slate-950">{item.label}</span>
              <span className="text-right">
                {item.count !== null ? (
                  <span className="block text-2xl font-semibold tabular-nums text-slate-950">{item.count}</span>
                ) : (
                  <span className="block text-sm font-semibold text-slate-700">{item.kind === "deadlines" ? "À voir" : "Indisponible"}</span>
                )}
                <span className="block text-xs text-slate-700">{item.countCaption}</span>
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.help}</p>
          </Link>
        ))}
      </nav>

      <section className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-5 sm:p-6" aria-labelledby="processing-active-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="info">File sélectionnée</Badge>
            <h2 id="processing-active-title" className="mt-3 text-xl font-bold text-slate-950">{active.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{active.help}.</p>
          </div>
          <Link href={active.href} className={buttonClassName("primary", "px-5")}>{active.actionLabel} →</Link>
        </div>
        {active.count === null && active.kind !== "deadlines" ? (
          <p role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Le compteur n’est pas disponible. Ouvrez la file pour examiner son état réel.</p>
        ) : null}
        {active.kind === "deadlines" ? (
          <p className="mt-4 text-sm leading-6 text-slate-700">Aucun délai n’est déduit automatiquement d’un programme. Consultez les échéances et leurs sources dans la file Personnes.</p>
        ) : null}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Link href="/admin/intake" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 hover:border-[var(--brand-border)]">
            <p className="font-semibold text-slate-950">Parcours et offres</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">Décider du parcours, contrôler l’acceptation et la validation du paiement →</p>
          </Link>
          <Link href="/admin/accompagnement" className="rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] p-4 hover:border-[var(--brand-border)]">
            <p className="font-semibold text-slate-950">Accompagnement de A à Z</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">Retrouver les dossiers par étape, le suivi visa et les actions de départ →</p>
          </Link>
        </div>
      </section>

      <details className="rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-4 sm:p-5">
        <summary className="cursor-pointer text-sm font-bold text-slate-900">Accéder aux autres outils de traitement</summary>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["/admin/prospects", "Qualification des prospects"],
            ["/admin/orientation", "Audits d’orientation"],
            ["/admin/payments", "Validation des paiements"],
            ["/admin/universities", "Catalogue et révalidations"],
            ["/admin/team", "Répartition et équipe"],
          ].map(([href, label]) => <Link key={href} href={href} className={buttonClassName("secondary", "px-3")}>{label}</Link>)}
        </div>
      </details>
    </main>
  );
}
