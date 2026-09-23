import { PageHeader } from "@/components/ui/PageHeader";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";

const labels: Record<string, string> = {
  not_started: "À démarrer",
  todo: "À faire",
  in_progress: "En cours",
  waiting_student: "Action requise",
  waiting_almago: "Suivi AlmaGo",
  completed: "Terminé",
};

const badgeVariants = {
  completed: "success",
  waiting_student: "warning",
  waiting_almago: "info",
  todo: "neutral",
  in_progress: "info",
  not_started: "neutral",
} as const;

export const dynamic = "force-dynamic";

export default async function ChecklistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return <ChecklistUnavailable />;
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const { data: items, error } = await supabase
    .from("student_checklist_items")
    .select("id,title,description,status,completed_at,checklist_templates(category,sort_order)")
    .order("created_at");

  if (error) return <ChecklistUnavailable />;

  const checklistItems = items || [];
  const completedCount = checklistItems.filter((item) => item.status === "completed").length;
  const progression = checklistItems.length ? Math.round((completedCount / checklistItems.length) * 100) : 0;
  const actionableItems = checklistItems.filter((item) =>
    ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status),
  );
  const waitingAlmaGoCount = checklistItems.filter((item) => item.status === "waiting_almago").length;
  const nextItem =
    actionableItems.find((item) => item.status === "waiting_student") ||
    actionableItems[0];

  const groups = new Map<string, (typeof checklistItems)[number][]>();
  for (const item of checklistItems) {
    const relation = Array.isArray(item.checklist_templates)
      ? item.checklist_templates[0]
      : item.checklist_templates;
    const category = relation?.category || "Autre";
    groups.set(category, [...(groups.get(category) || []), item]);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader
        badge="Mes démarches"
        title="Mes démarches"
        description="Retrouvez les démarches enregistrées, les actions attendues de votre côté et les étapes suivies par AlmaGo."
        actions={<ButtonLink href="/student/documents" variant="secondary">Voir mes documents</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card aria-labelledby="checklist-progress-title" className="bg-slate-950 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent-light)]">Avancement</p>
              <h2 id="checklist-progress-title" className="mt-4 text-3xl font-semibold tracking-tight">Progression des démarches</h2>
            </div>
            <Badge variant={checklistItems.length > 0 && progression === 100 ? "success" : "info"}>
              {checklistItems.length ? `${completedCount}/${checklistItems.length} terminées` : "Aucune étape"}
            </Badge>
          </div>
          <div className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-4">
              <p className="text-5xl font-semibold tracking-tight">{checklistItems.length ? `${progression}%` : "—"}</p>
              <p className="text-right text-sm text-slate-300">Étapes réellement enregistrées dans votre dossier</p>
            </div>
            {checklistItems.length > 0 && <div className="[&_[role=progressbar]]:bg-white/15 [&_[role=progressbar]>div]:bg-[var(--accent)]"><ProgressBar value={progression} label="Progression des démarches" /></div>}
          </div>
        </Card>

        <Card aria-labelledby="checklist-next-action-title">
          <div className="flex items-center justify-between gap-3">
            <Badge variant={nextItem ? "warning" : waitingAlmaGoCount ? "info" : "neutral"}>
              {nextItem ? "Prochaine action" : waitingAlmaGoCount ? "En attente" : "Aucune action enregistrée"}
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {nextItem ? "Vous" : waitingAlmaGoCount ? "AlmaGo" : "Suivi"}
            </span>
          </div>
          {nextItem ? (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{nextItem.title}</h2>
              {nextItem.description && <p className="mt-3 text-sm leading-6 text-slate-600">{nextItem.description}</p>}
              <div className="mt-5"><Badge variant={nextItem.status === "waiting_student" ? "warning" : "info"}>{labels[nextItem.status] || nextItem.status}</Badge></div>
            </>
          ) : (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-semibold text-slate-950">{waitingAlmaGoCount ? "Étapes en attente côté AlmaGo" : "Aucune action enregistrée"}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">{waitingAlmaGoCount ? "Aucune action n’est actuellement demandée de votre côté. Consultez les étapes suivies ci-dessous." : "Aucune action n’est actuellement demandée de votre côté. Consultez les démarches enregistrées ci-dessous."}</p>
            </>
          )}
        </Card>
      </div>

      <section aria-label="Résumé des démarches" className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard title="À traiter" value={actionableItems.length} badge="Côté étudiant" tone={actionableItems.length ? "warning" : "success"} />
        <SummaryCard title="Suivi AlmaGo" value={waitingAlmaGoCount} badge="En attente" tone="info" />
        <SummaryCard title="Terminées" value={completedCount} badge="Étapes" tone="success" />
      </section>

      {checklistItems.length === 0 ? (
        <Card aria-labelledby="checklist-empty-title" className="mt-6 border-dashed text-center">
          <h2 id="checklist-empty-title" className="text-lg font-semibold text-slate-950">Aucune démarche enregistrée</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            Aucune démarche n’est enregistrée dans votre dossier pour le moment. Vous pouvez vérifier vos documents ou revenir à votre dossier.
          </p>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.entries()].map(([category, group]) => {
            const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
            const groupCompleted = group.filter((item) => item.status === "completed").length;
            return (
              <section key={category} aria-labelledby={categoryId}>
                <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">Catégorie</p>
                    <h2 id={categoryId} className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{category}</h2>
                  </div>
                  <Badge variant={groupCompleted === group.length ? "success" : "neutral"}>{groupCompleted}/{group.length} terminées</Badge>
                </div>
                <div className="space-y-3">
                  {group.map((item) => (
                    <Card as="article" key={item.id} aria-labelledby={`checklist-item-title-${item.id}`} className={item.status === "waiting_student" ? "border-amber-300 bg-amber-50/40 shadow-none" : "shadow-none"}>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={badgeVariants[item.status as keyof typeof badgeVariants] || "neutral"}>
                              {labels[item.status] || item.status}
                            </Badge>
                            {item.status === "waiting_student" && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">Action demandée</span>}
                          </div>
                          <h3 id={`checklist-item-title-${item.id}`} className="mt-3 font-semibold text-slate-950">{item.title}</h3>
                          {item.description && <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>}
                          {item.completed_at && (
                            <p className="mt-3 text-xs text-slate-500">
                              Terminé le{" "}
                              <time dateTime={item.completed_at}>
                                {new Intl.DateTimeFormat("fr-TN", { dateStyle: "medium" }).format(new Date(item.completed_at))}
                              </time>
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ title, value, badge, tone }: { title: string; value: number; badge: string; tone: "success" | "info" | "warning" | "neutral" }) {
  return (
    <Card as="article" className="shadow-none">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
      <div className="mt-3"><Badge variant={tone}>{badge}</Badge></div>
    </Card>
  );
}

function ChecklistUnavailable() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader badge="Mes démarches" title="Mes démarches" />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">Démarches temporairement indisponibles</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Impossible de charger les étapes du dossier pour le moment. Leur état n’a pas été modifié. Vous pouvez relancer le chargement ou revenir à votre dossier.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/checklist">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
