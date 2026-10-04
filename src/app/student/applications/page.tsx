import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { StudentJourneyHeader } from "@/components/student/StudentJourneyHeader";
import { StudentApplicationsPanel } from "@/components/student/StudentApplicationsPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentApplicationsCopy } from "@/content/student-applications-copy";

export const dynamic = "force-dynamic";

export default async function StudentApplicationsPage() {
  const locale = await getRequestLocale();
  const t = studentApplicationsCopy[locale];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id,status,intake_term:intake,deadline,deadline_kind,deadline_source_url,deadline_verified_at,deadline_cycle,application_method,next_action,required_documents,student_notes,result,submitted_at,created_at,programs(name,degree_level,universities(name,city)),application_events(id,event_type,message,created_at)")
    .order("created_at", { ascending: false });

  if (error) {
    return <ApplicationsUnavailable copy={t} />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader
        current="applications"
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        actions={<ButtonLink href="/student/orientation" variant="secondary">{t.page.programmes}</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow={t.page.guidanceEyebrow}
        title={t.page.guidanceTitle}
        description={t.page.guidanceDescription}
        points={[...t.page.guidancePoints]}
      />

      <StudentApplicationsPanel applications={data || []} />
    </main>
  );
}

function ApplicationsUnavailable({ copy }: { copy: (typeof studentApplicationsCopy)["fr"] }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <StudentJourneyHeader current="applications" eyebrow={copy.page.eyebrow} title={copy.page.title} />
      <Card>
        <div role="alert">
          <h2 className="text-xl font-semibold text-slate-950">{copy.page.unavailableTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {copy.page.unavailableText}
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/student/applications">{copy.page.retry}</ButtonLink>
          <ButtonLink href="/student/orientation" variant="secondary">{copy.page.recommendations}</ButtonLink>
        </div>
      </Card>
    </main>
  );
}
