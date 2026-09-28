import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/student/ProfileForm";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StudentEntryProgress } from "@/components/student/StudentEntryProgress";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentProfileCopy } from "@/content/student-profile-copy";

export const dynamic = "force-dynamic";
export default async function ProfilePage() {
  const locale = await getRequestLocale();
  const t = studentProfileCopy[locale];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("first_name,last_name,birth_date,nationality,current_city,phone,last_diploma,bac_track,bac_year,general_average,institution,current_university_studies,current_field,university_semesters,german_level,english_level,french_level,language_certificate,language_certificate_other,target_degree,target_field,study_language,target_intake,preferred_cities,budget_range,onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
        <PageHeader
          badge={t.page.badge}
          title={t.page.title}
          actions={<ButtonLink href="/student" variant="secondary">{t.page.back}</ButtonLink>}
        />
        <Card>
          <div role="alert">
            <h2 className="text-xl font-semibold text-slate-950">{t.page.unavailableTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t.page.unavailableText}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/student/profile">{t.page.retry}</ButtonLink>
            <ButtonLink href="/student" variant="secondary">{t.page.back}</ButtonLink>
          </div>
        </Card>
      </main>
    );
  }
  if (!profile?.onboarding_completed) redirect("/student/onboarding");

  const requiredProfileKeys = [
    "first_name",
    "last_name",
    "nationality",
    "target_degree",
    "target_field",
    "study_language",
    "target_intake",
  ] as const;
  const completedRequiredFields = requiredProfileKeys.filter((key) => {
    const value = profile[key];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
  const profileCompletion = Math.round((completedRequiredFields / requiredProfileKeys.length) * 100);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <PageHeader
        badge={t.page.badge}
        title={t.page.title}
        description={t.page.description}
        actions={<ButtonLink href="/student" variant="secondary">{t.page.back}</ButtonLink>}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(15rem,0.35fr)_minmax(0,1fr)] lg:gap-6">
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start" aria-label={t.page.landmarks}>
          <Card className="shadow-none">
            <StudentEntryProgress current={3} compact />
            <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
              {t.page.accountReady}
            </p>
          </Card>

          <Card className="border-[var(--brand-border)] bg-white shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge variant={profileCompletion === 100 ? "success" : "info"}>{t.page.profileBadge}</Badge>
              <span className="text-sm font-bold text-[var(--brand)]">{profileCompletion}%</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-[-0.02em] text-slate-950">{t.page.profileFilled}</h2>
            <div className="mt-4">
              <ProgressBar value={profileCompletion} label={t.page.progressLabel} />
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {t.page.progressBoundary}
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">{t.page.whyEyebrow}</p>
            <h2 className="mt-3 text-lg font-semibold text-slate-950">{t.page.whyTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.page.whyText}
            </p>
          </Card>

          <Card className="shadow-none">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{t.page.checkEyebrow}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t.page.checkText}
            </p>
          </Card>
        </aside>

        <Card as="div" className="overflow-hidden border-[var(--border)] bg-white shadow-none">
          <ProfileForm profile={profile} />
        </Card>
      </div>
    </main>
  );
}
