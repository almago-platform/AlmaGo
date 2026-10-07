import { AdminLanguageCoursesPanel } from "@/components/admin/AdminLanguageCoursesPanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminWorkspaceSummary } from "@/components/admin/AdminWorkspaceSummary";
import { isCatalogVerificationCurrent } from "@/lib/catalog-freshness";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLanguageCoursesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("language_courses")
    .select("id,title,provider_name,city,language,purpose,level_from,level_to,hours_per_week,starts_on,ends_on,price_cents,currency,source_url,application_url,verified_at,is_active")
    .order("title");

  if (error) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Catalogue Allemagne" title="Cours de langue" description="Catalogue sourcé des préparations linguistiques et séjours de langue." />
        <AdminLoadError
          title="Le catalogue des cours est temporairement indisponible"
          description="Nous n’arrivons pas à charger les cours de langue pour le moment."
          retryHref="/admin/language-courses"
        />
      </main>
    );
  }

  const courses = data || [];
  const activeCount = courses.filter((course) => course.is_active).length;
  const staleCount = courses.filter((course) => course.is_active && !isCatalogVerificationCurrent(course.verified_at)).length;

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Catalogue Allemagne"
        title="Cours de langue"
        description="Maintenez uniquement des cours sourcés et datés. Les éléments publiés doivent rester distingués entre préparation aux études et séjour linguistique autonome."
      />
      <AdminWorkspaceSummary
        eyebrow="Catalogue langue"
        title="Cours publiés et vérifications"
        description="Une fiche active doit rester sourcée et datée. Les éléments expirés doivent être revérifiés avant de rester fiables pour l’étudiant."
        metrics={[
          { label: "Cours", value: courses.length },
          { label: "Actifs", value: activeCount, tone: activeCount ? "success" : "neutral" },
          { label: "À revalider", value: staleCount, tone: staleCount ? "warning" : "neutral" },
        ]}
      />
      <AdminLanguageCoursesPanel courses={courses} />
    </main>
  );
}
