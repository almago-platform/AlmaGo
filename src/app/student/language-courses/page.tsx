import { PageHeader } from "@/components/ui/PageHeader";
import { StudentLanguageCoursesPanel } from "@/components/student/StudentLanguageCoursesPanel";

export const dynamic = "force-dynamic";

export default function StudentLanguageCoursesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Projet Allemagne"
        title="Cours de langue vérifiés"
        description="Consultez les cours enregistrés à partir de sources officielles et distinguez clairement une préparation aux études d’un cours de langue autonome."
      />

      <StudentLanguageCoursesPanel />
    </main>
  );
}
