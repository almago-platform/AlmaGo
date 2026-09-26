import { redirect } from "next/navigation";
import { StudentProjectForm } from "@/components/student/StudentProjectForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: project } = await supabase.from("student_projects")
    .select("path,target_degree,target_field,target_intake,preferred_cities,current_german_level,target_german_level,current_diploma,diploma_country,filing_country,preferred_study_language,monthly_budget,budget_currency,actual_objective,notes")
    .eq("student_id", user.id)
    .maybeSingle();

  return <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
    <PageHeader
      badge="Mon projet"
      title="Définissons votre point de départ"
      description="Décrivez votre situation et votre objectif avec vos propres mots. AlmaGo utilise ces informations pour organiser les prochaines étapes sans vous demander de choisir vous-même une catégorie juridique de visa."
    />
    <StudentProjectForm project={project as Parameters<typeof StudentProjectForm>[0]["project"]} />
  </main>;
}
