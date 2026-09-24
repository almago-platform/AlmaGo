import { redirect } from "next/navigation";
import { getStudentUser } from "@/lib/auth/access";
import { OnboardingForm } from "@/components/student/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { supabase, user, isStudent } = await getStudentUser();
  if (!user) redirect("/login");
  if (!isStudent) redirect("/unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name,last_name,birth_date,nationality,current_city,phone,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,language_certificate,language_certificate_other,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed",
    )
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.onboarding_completed) redirect("/student");

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <OnboardingForm profile={profile || {}} />
    </main>
  );
}
