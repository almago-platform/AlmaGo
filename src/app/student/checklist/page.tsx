import { PageHeader } from "@/components/ui/PageHeader";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getStudentUser } from "@/lib/auth/access";

const labels: Record<string, string> = {
  not_started: "À faire par vous",
  todo: "À faire par vous",
  in_progress: "En cours",
  waiting_student: "À faire par vous",
  waiting_almago: "En cours chez AlmaGo",
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
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) redirect("/login");
  if (!isStudent) redirect("/unauthorized");

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
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Mes démarches"
        title="Mes démarches"
        description="Voyez en un coup d’œil ce qui est à faire par vous, ce qu’AlmaGo suit et les étapes déjà terminées dans votre dossier."
        actions={<ButtonLink href="/student/documents" variant="secondary">Voir mes documents</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card aria-labelledby="checklist-progress-title" className="relative overflow-hidden border-[var(--brand-border)] bg-white shadow-[0_24px_55px_-38px_rgba(41,48,139,0.5)]">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-[var(--brand)]" />
          <div className="pl-2 sm:pl-3">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Votre progression</p>
                <h2 id="checklist-progress-title" className="mt-3 text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">Démarches enregistrées dans votre dossier</h2>
              </div>
              <Badge variant={checklistItems.length > 0 && progression === 100 ? "success" : "info"}>
                {checklistItems.length ? `${completedCount}/${checklistItems.length} terminées` : "Aucune étape"}
              </Badge>
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-end justify-between gap-4">
                <p className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{checklistItems.length ? `${progression}%` : "—"}</p>
                <p className="max-w-xs text-right text-sm leading-6 text-slate-600">Étapes réellement enregistrées dans AlmaGo</p>
              </div>
              {checklistItems.length > 0 && <ProgressBar value={progression} label="Progression des démarches enregistrées" />}
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Cette progression concerne les démarches enregistrées dans votre dossier. Elle ne représente ni une admission ni une validation finale.
            </p>
          </div>
        </Card>

        <Card aria-labelledby="checklist-next-action-title" className={nextItem ? "border-amber-200 bg-amber-50/25 shadow-none" : "shadow-none"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge variant={nextItem ? "warning" : waitingAlmaGoCount ? "info" : "neutral"}>
              {nextItem ? "À faire maintenant" : waitingAlmaGoCount ? "Suivi en cours" : "Aucune action demandée"}
            </Badge>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              {nextItem ? "À faire par vous" : waitingAlmaGoCount ? "En cours chez AlmaGo" : "Dossier"}
            </span>
          </div>
          {nextItem ? (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">{nextItem.title}</h2>
              {nextItem.description && <p className="mt-3 text-sm leading-6 text-slate-700">{nextItem.description}</p>}
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-amber-900 ring-1 ring-amber-200">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                {labels[nextItem.status] || "À faire par vous"}
              </div>
            </>
          ) : (
            <>
              <h2 id="checklist-next-action-title" className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                {waitingAlmaGoCount ? "Vous n’avez rien à faire pour le moment" : "Aucune action n’est demandée actuellement"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {waitingAlmaGoCount
                  ? "AlmaGo suit actuellement certaines étapes de votre dossier. Vous pouvez consulter leur détail ci-dessous."
                  : "Les démarches enregistrées dans votre dossier apparaissent ci-dessous. Une nouvelle action sera mise en évidence lorsqu’elle vous concernera."}
              </p>
            </>
          )}
        </Card>
      </div>

      <section aria-label="Résumé des démarches" className="mt-5 grid gap-4 sm:grid-cols-3">
        <SummaryCard title="À faire par vous" value={actionableItems.length} badge={actionableItems.length ? "À traiter" : "Rien à faire"} tone={actionableItems.length ? "warning" : "success"} />
        <SummaryCard title="En cours chez AlmaGo" value={waitingAlmaGoCount} badge={waitingAlmaGoCount ? "Suivi en cours" : "Aucune étape"} tone="info" />
        <SummaryCard title="Terminées" value={completedCount} badge="Étapes complétées" tone="success" />
      </section>

      {checklistItems.length === 0 ? (
        <Card aria-labelledby="checklist-empty-title" className="mt-6 border-dashed bg-white/70 py-9 text-center">
          <span aria-hidden="true" className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">✓</span>
          <h2 id="checklist-empty-title" className="mt-4 text-lg font-bold text-slate-950">Aucune démarche n’est enregistrée pour le moment.</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            Lorsqu’une nouvelle étape sera ajoutée à votre dossier, elle apparaîtra ici avec son responsable et son statut.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <ButtonLink href="/student">Retour à mon dossier</ButtonLink>
            <ButtonLink href="/student/documents" variant="secondary">Voir mes documents</ButtonLink>
          </div>
        </Card>
      ) : (
        <div className="mt-8 space-y-8">
          {[...groups.entries()].map(([category, group]) => {
            const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`;
            const groupCompleted = group.filter((item) => item.status === "completed").length;
            return (
              <section key={category} aria-labelledby={categoryId}>
                <div className="mb-4 flex flex-col justify-between gap-3 border-b border-[var(--border)] pb-3 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Étape du dossier</p>
                    <h2 id={categoryId} className="mt-1 text-xl font-bold tracking-[-0.02em] text-slate-950">{category}</h2>
                  </div>
                  <Badge variant={groupCompleted === group.length ? "success" : "neutral"}>{groupCompleted}/{group.length} terminées</Badge>
                </div>
                <div className="space-y-3">
                  {group.map((item) => (
                    <Card as="article" key={item.id} aria-labelledby={`checklist-item-title-${item.id}`} className={item.status === "waiting_student" || item.status === "todo" || item.status === "not_started" ? "border-amber-200 bg-amber-50/25 shadow-none" : item.status === "waiting_almago" ? "border-blue-200 bg-blue-50/20 shadow-none" : "shadow-none"}>
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={badgeVariants[item.status as keyof typeof badgeVariants] || "neutral"}>
                              {labels[item.status] || item.status}
                            </Badge>
                            {["waiting_student", "todo", "not_started"].includes(item.status) && <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">À faire par vous</span>}
                            {item.status === "waiting_almago" && <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">En cours chez AlmaGo</span>}
                          </div>
                          <h3 id={`checklist-item-title-${item.id}`} className="mt-3 font-bold text-slate-950">{item.title}</h3>
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
          <p className="mt-2 text-sm leading-6 text-slate-600">Nous n’arrivons pas à afficher vos démarches pour le moment. Rien n’a été supprimé ou modifié. Vous pouvez réessayer ou revenir à votre dossier.</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/student/checklist">Réessayer</ButtonLink>
          <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
