import { StudentResourceHeader } from "@/components/student/StudentResourceHeader";
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
    <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
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
    </main>
  );
}
