import { AdminOrientationPanel } from "@/components/admin/AdminOrientationPanel";
import { AdminOrientationHumanReviewQueue } from "@/components/admin/AdminOrientationHumanReviewQueue";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminOrientationPage() {
  const supabase = await createClient();
  const [
    { data: students, error: studentsError },
    { data: programs, error: programsError },
    { data: recommendations, error: recommendationsError },
    { data: reviewData, error: reviewsError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,last_name,target_degree,target_field,study_language,general_average,preferred_cities,onboarding_completed")
      .order("last_name"),
    supabase
      .from("programs")
      .select("id,name,degree_level,field,universities(name,city)")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("program_recommendations")
      .select("id,student_id,program_id,status,note,is_archived")
      .order("created_at", { ascending: false }),
    supabase
      .from("orientation_human_reviews")
      .select("id,orientation_id,pipeline_status,selected_count,review_status,approved_selection,counselor_note,reviewed_at,created_at,profile,bundle")
      .order("created_at", { ascending: false })
      .limit(40),
  ]);

  if (studentsError || programsError || recommendationsError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader section="Opérations" title="Orientation" description="Préparation et publication des recommandations étudiantes." />
        <AdminLoadError
          title="L’orientation est temporairement indisponible"
          description="Nous n’arrivons pas à charger les profils, programmes ou recommandations pour le moment."
          retryHref="/admin/orientation"
        />
      </main>
    );
  }

  const reviewRows = (reviewData || []) as Array<{
    id: string;
    orientation_id: string | null;
    pipeline_status: string;
    selected_count: number;
    review_status: string;
    approved_selection: unknown;
    counselor_note: string | null;
    reviewed_at: string | null;
    created_at: string;
    profile: unknown;
    bundle: unknown;
  }>;

  const orientationIds = reviewRows.flatMap((review) =>
    review.orientation_id ? [review.orientation_id] : []
  );
  const orientationToProspect = new Map<string, string>();
  if (orientationIds.length) {
    const { data } = await supabase
      .from("orientations")
      .select("id,prospect_id")
      .in("id", orientationIds);
    for (const row of data || []) {
      orientationToProspect.set(String(row.id), String(row.prospect_id));
    }
  }

  const prospectIds = [...new Set(orientationToProspect.values())];
  const prospectEmail = new Map<string, string>();
  if (prospectIds.length) {
    const { data } = await supabase
      .from("prospects")
      .select("id,email")
      .in("id", prospectIds);
    for (const row of data || []) {
      prospectEmail.set(String(row.id), String(row.email));
    }
  }

  const humanReviews = reviewRows.map((review) => {
    const prospectId = review.orientation_id
      ? orientationToProspect.get(review.orientation_id)
      : null;
    return {
      ...review,
      approved_selection: Array.isArray(review.approved_selection)
        ? review.approved_selection.filter((item): item is string => typeof item === "string")
        : [],
      prospect_email: prospectId ? prospectEmail.get(prospectId) || null : null,
    };
  });

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Opérations"
        title="Orientation"
        description="Préparez une recommandation à partir du profil enregistré, documentez les éléments vérifiés et gardez explicite la frontière entre orientation et décision d’admission."
      />
      <AdminOrientationHumanReviewQueue
        reviews={humanReviews}
        available={!reviewsError}
      />
      <AdminOrientationPanel
        students={students || []}
        programs={programs || []}
        recommendations={recommendations || []}
      />
    </main>
  );
}
