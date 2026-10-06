import { StudentResourceHeader } from "@/components/student/StudentResourceHeader";
import { StudentPageFrame } from "@/components/student/StudentPageFrame";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StudentLanguageCoursesPanel } from "@/components/student/StudentLanguageCoursesPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";
import { studentLanguageCoursesCopy } from "@/content/student-language-courses-copy";
import { rebrandCopy } from "@/lib/brand";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function StudentLanguageCoursesPage() {
  const locale = await getRequestLocale();
  const t = rebrandCopy(studentLanguageCoursesCopy[locale]);

  return (
    <StudentPageFrame>
      <StudentResourceHeader
        current="language"
        title={t.page.title}
        description={t.page.description}
        actions={<ButtonLink href="/student/pathway" variant="secondary">{t.page.back}</ButtonLink>}
      />

      <StudentGuidancePanel
        eyebrow={t.page.guidanceEyebrow}
        title={t.page.guidanceTitle}
        description={t.page.guidanceDescription}
        points={[...t.page.guidancePoints]}
      />

      <StudentLanguageCoursesPanel />
    </StudentPageFrame>
  );
}
