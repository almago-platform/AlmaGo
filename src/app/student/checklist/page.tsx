import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/server";

const labels: Record<string, string> = {
  not_started: "À démarrer",
  todo: "À faire",
  in_progress: "En cours",
  waiting_student: "Action requise",
  waiting_almago: "En attente d’AlmaGo",
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const { data: items, error } = await supabase
    .from("student_checklist_items")
    .select("id,title,description,status,completed_at,checklist_templates(category,sort_order)")
    .order("created_at");

  const checklistItems = items || [];
  const completedCount = checklistItems.filter((item) => item.status === "completed").length;
  const progression = checklistItems.length ? Math.round((completedCount / checklistItems.length) * 100) : 0;
  const actionableItems = checklistItems.filter((item) =>
    ["waiting_student", "todo", "in_progress", "not_started"].includes(item.status),
  );
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
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Checklist</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Mes prochaines étapes</h1>
        <p className="mt-3 text-slate-600">
          Suis l’avancement de ton dossier et vois immédiatement ce qui demande ton attention.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Progression globale</p>
              <p className="mt-1 text-3xl font-semibold text-slate-950">{progression}%</p>
            </div>
            <Badge variant={progression === 100 ? "success" : "neutral"}>
              {completedCount}/{checklistItems.length} terminées
            </Badge>
          </div>
          <div className="mt-5">
            <ProgressBar value={progression} label="Progression de la checklist" />
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-600">Prochaine action</p>
          {nextItem ? (
            <>
              <div className="mt-3">
                <Badge variant={nextItem.status === "waiting_student" ? "warning" : "info"}>
                  {labels[nextItem.status] || nextItem.status}
                </Badge>
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-950">{nextItem.title}</h2>
              {nextItem.description && <p className="mt-2 text-sm text-slate-600">{nextItem.description}</p>}
            </>
          ) : (
            <>
              <Badge variant="success">Dossier à jour</Badge>
              <h2 className="mt-3 text-lg font-semibold text-slate-950">Aucune action urgente</h2>
              <p className="mt-2 text-sm text-slate-600">AlmaGo mettra cette page à jour dès qu’une nouvelle étape sera nécessaire.</p>
            </>
          )}
        </Card>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Impossible de charger la checklist pour le moment. Réessaie dans quelques instants.
        </div>
      )}

      {!error && checklistItems.length === 0 ? (
        <Card className="mt-6 border-dashed text-center">
          <h2 className="text-lg font-semibold text-slate-950">Ta checklist arrive bientôt</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            AlmaGo préparera ici tes étapes personnalisées à partir de ton profil et de ton dossier.
          </p>
        </Card>
      ) : (
        <div className="mt-8 space-y-7">
          {[...groups.entries()].map(([category, group]) => (
            <section key={category} aria-labelledby={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2
                  id={`category-${category.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-lg font-semibold text-slate-950"
                >
                  {category}
                </h2>
                <span className="text-sm text-slate-500">{group.filter((item) => item.status === "completed").length}/{group.length}</span>
              </div>
              <div className="space-y-3">
                {group.map((item) => (
                  <Card as="article" key={item.id} className={item.status === "waiting_student" ? "border-amber-200" : ""}>
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-950">{item.title}</h3>
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
                      <Badge variant={badgeVariants[item.status as keyof typeof badgeVariants] || "neutral"}>
                        {labels[item.status] || item.status}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
