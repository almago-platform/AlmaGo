import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { OnboardingForm } from "@/components/student/OnboardingForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,birth_date,nationality,current_city,phone,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,language_certificate,language_certificate_other,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profile?.onboarding_completed) redirect("/student");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_58%,#f1ece4_100%)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[rgba(255,253,248,0.96)] backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label="Retour à l'accueil AlmaGo">
            <BrandLogo className="h-auto w-32 sm:w-36" />
          </Link>
          <div className="text-right">
            <p className="text-[0.66rem] font-bold uppercase tracking-[0.13em] text-[var(--brand)]">Configuration du dossier</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Vos réponses sont enregistrées étape par étape.</p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <OnboardingForm profile={profile || {}} />
      </div>
    </main>
  );
}
