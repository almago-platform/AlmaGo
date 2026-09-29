import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { OnboardingForm } from "@/components/student/OnboardingForm";
import { StudentEntryProgress } from "@/components/student/StudentEntryProgress";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentOnboardingCopy } from "@/content/student-onboarding-copy";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const locale = await getRequestLocale();
  const t = studentOnboardingCopy[locale];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name,last_name,birth_date,nationality,current_city,phone,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,language_certificate,language_certificate_other,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed")
    .eq("id", user.id)
    .single();

  if (profileError) return <OnboardingUnavailable copy={t} />;
  if (profile?.onboarding_completed) redirect("/student");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_58%,#f1ece4_100%)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-[rgba(255,253,248,0.96)] backdrop-blur">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label={t.homeAria}>
            <BrandLogo className="h-auto w-36 sm:w-48" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <div className="hidden min-w-[19rem] sm:block">
              <StudentEntryProgress current={2} compact />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <div className="mb-5 sm:hidden">
          <StudentEntryProgress current={2} compact />
        </div>
        <OnboardingForm profile={profile || {}} />
      </div>
    </main>
  );
}

function OnboardingUnavailable({ copy }: { copy: (typeof studentOnboardingCopy)["fr"] }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffdf8_0%,#f7f4ec_58%,#f1ece4_100%)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="inline-flex min-h-11 items-center" aria-label={copy.homeAria}>
            <BrandLogo className="h-auto w-36 sm:w-48" />
          </Link>
          <LanguageSwitcher compact />
        </div>
        <div className="mt-6">
          <StudentEntryProgress current={2} compact />
        </div>
        <Card className="mt-5">
          <div role="alert">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">{copy.unavailable.eyebrow}</p>
            <h1 className="editorial-accent mt-2 text-2xl leading-tight text-[var(--foreground)] sm:text-3xl">{copy.unavailable.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy.unavailable.text}</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/student/onboarding">{copy.unavailable.retry}</ButtonLink>
            <ButtonLink href="/" variant="secondary">{copy.unavailable.home}</ButtonLink>
          </div>
        </Card>
      </div>
    </main>
  );
}
