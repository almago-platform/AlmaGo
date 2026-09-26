import { PageHeader } from "@/components/ui/PageHeader";
import { StudentLanguageCoursesPanel } from "@/components/student/StudentLanguageCoursesPanel";
import { StudentGuidancePanel } from "@/components/student/StudentGuidancePanel";

export const dynamic = "force-dynamic";

export default function StudentLanguageCoursesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
      <PageHeader
        badge="Projet Allemagne"
        title="Cours de langue vérifiés"
        description="Consultez les cours enregistrés à partir de sources officielles et distinguez clairement une préparation aux études d’un cours de langue autonome."
      />

      <StudentGuidancePanel
        eyebrow="Avant de choisir un cours"
        title="Le bon cours dépend de votre objectif d’études, pas seulement du niveau affiché."
        description="Utilisez le catalogue pour comprendre le rôle du cours dans votre projet. Vérifiez ensuite les conditions directement auprès de l’organisme qui le propose."
        points={[
          "Distinguer préparation aux études et cours de langue autonome.",
          "Vérifier le niveau, le format et la source officielle.",
          "Relier votre choix au parcours académique réellement visé.",
        ]}
      />

      <StudentLanguageCoursesPanel />
    </main>
  );
}
