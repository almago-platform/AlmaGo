import { redirect } from "next/navigation";
import { StudentProjectForm } from "@/components/student/StudentProjectForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StudentProjectPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: project } = await supabase.from("student_projects")
    .select("path,target_degree,target_field,target_intake,preferred_cities,current_german_level,target_german_level,notes")
    .eq("student_id", user.id).maybeSingle();

  return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">Mon projet Allemagne</p>
    <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Définissons votre point de départ</h1>
    <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">Votre choix structure l’accompagnement AlmaGo. Vous pourrez le modifier si votre objectif évolue. Il ne constitue ni une admission, ni un conseil juridique, ni une garantie de visa.</p>
    <StudentProjectForm project={project as Parameters<typeof StudentProjectForm>[0]["project"]} />
  </main>;
}
