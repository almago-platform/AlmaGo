import { redirect } from "next/navigation";
import { StudentProjectForm } from "@/components/student/StudentProjectForm";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
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

  return <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
    <StudentJourneyHeader
      current="project"
      eyebrow="Mon dossier"
      title="Quel est votre projet ?"
      description="Décrivez votre situation et votre objectif. Ces informations servent à afficher les étapes utiles. Vous n’avez pas à choisir un type de visa."
    />
    <StudentProjectForm project={project as Parameters<typeof StudentProjectForm>[0]["project"]} />
  </main>;
}
