import { ButtonLink } from "@/components/ui/ButtonLink";
import { buttonClassName } from "@/components/ui/Button";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { StudentPageState } from "@/components/student/StudentPageState";
import Link from "next/link";
import { DossierHeader } from "@/components/product/DossierHeader";
import { StudentApplicationsPanel } from "@/components/student/StudentApplicationsPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { createClient } from "@/lib/supabase/server";
import { getRequestLocale } from "@/lib/i18n-server";
import { studentApplicationsCopy } from "@/content/student-applications-copy";
import { isActiveApplication, isSubmittedApplicationStatus } from "@/lib/application-workflow";
import { evaluateCampusApplicationDeadline } from "@/lib/student/procedure-deadline";

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

  const applications = data || [];
  const activeCount = applications.filter((application) => isActiveApplication(application.status)).length;
  const submittedCount = applications.filter((application) =>
    Boolean(application.submitted_at) || isSubmittedApplicationStatus(application.status),
  ).length;
  const actionCount = applications.filter((application) =>
    isActiveApplication(application.status) && Boolean(application.next_action),
  ).length;
  const verifiedDeadlineCount = applications.filter((application) => {
    const status = evaluateCampusApplicationDeadline(application).status;
    return status === "open" || status === "closed";
  }).length;

  return (
    <StudentPageFrame className="space-y-7">
      <DossierHeader
        eyebrow={t.page.eyebrow}
        title={t.page.title}
        description={t.page.description}
        status={actionCount ? t.panel.actionNeeded : t.panel.tracking}
        statusVariant={actionCount ? "warning" : "info"}
        facts={[
          { label: t.panel.activeApplications, value: activeCount },
          { label: t.panel.submittedApplications, value: submittedCount },
          { label: t.panel.todo, value: actionCount },
          { label: t.panel.nextDeadline, value: verifiedDeadlineCount },
        ]}
        actions={
          <>
            <Link href="/student/procedure" className={buttonClassName("secondary", "min-h-10 px-4 py-2")}>
              {locale === "fr" ? "Voir ma procédure" : locale === "ar" ? "عرض إجراءاتي" : locale === "de" ? "Mein Verfahren" : "View procedure"}
            </Link>
            <ButtonLink href="/student/orientation" variant="secondary">{t.page.programmes}</ButtonLink>
          </>
        }
      />

      <StudentGuidancePanel
        eyebrow={t.page.guidanceEyebrow}
        title={t.page.guidanceTitle}
        description={t.page.guidanceDescription}
        points={[...t.page.guidancePoints]}
      />

      <StudentApplicationsPanel applications={applications} />
    </StudentPageFrame>
  );
}

function ApplicationsUnavailable({ copy }: { copy: (typeof studentApplicationsCopy)["fr"] }) {
  return (
    <StudentPageFrame className="space-y-7">
      <DossierHeader
        eyebrow={copy.page.eyebrow}
        title={copy.page.title}
        status={copy.page.unavailableTitle}
        statusVariant="warning"
      />
      <StudentPageState
        variant="warning"
        title={copy.page.unavailableTitle}
        description={copy.page.unavailableText}
        actions={
          <>
            <ButtonLink href="/student/applications">{copy.page.retry}</ButtonLink>
            <ButtonLink href="/student/orientation" variant="secondary">{copy.page.recommendations}</ButtonLink>
          </>
        }
      />
    </StudentPageFrame>
  );
}
