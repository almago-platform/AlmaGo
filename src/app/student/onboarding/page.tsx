import { redirect } from "next/navigation";
import { getStudentUser } from "@/lib/auth/access";
import { OnboardingForm } from "@/components/student/OnboardingForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) redirect("/login");
  if (!isStudent) redirect("/unauthorized");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "first_name,last_name,birth_date,nationality,current_city,phone,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,language_certificate,language_certificate_other,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <PageHeader badge="Profil étudiant" title="Préparation du dossier" />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-bold text-slate-950">Profil temporairement indisponible</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Nous n’arrivons pas à charger les informations déjà enregistrées. Rien n’a été supprimé ou remplacé. Réessayez avant de saisir de nouvelles données.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/student/onboarding">Réessayer</ButtonLink>
            <ButtonLink href="/student" variant="secondary">Retour à mon dossier</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }

  if (profile?.onboarding_completed) redirect("/student");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <OnboardingForm profile={profile || {}} />
    </main>
  );
}
