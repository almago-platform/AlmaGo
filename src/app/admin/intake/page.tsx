import Link from "next/link";
import { buttonClassName } from "@/components/ui/Button";
import { AdminIntakePanel } from "@/components/admin/AdminIntakePanel";
import { AdminLoadError } from "@/components/admin/AdminLoadError";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { createClient } from "@/lib/supabase/server";

function serviceItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

export const dynamic = "force-dynamic";

export default async function AdminIntakePage() {
  const supabase = await createClient();

  const { data: intakeCases, error: intakeError } = await supabase
    .from("student_intake_cases")
    .select("student_id,orientation_id,status,proposed_route_key,proposal_reason,proposed_offer_version_id,purchase_id,student_response_note,student_responded_at,updated_at")
    .order("updated_at", { ascending: false });

  if (intakeError) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Dossiers"
          title="Validation du parcours"
          description="Orientation, pièces de départ et décision Campus Allemagne."
        />
        <AdminLoadError
          title="La file de validation est temporairement indisponible"
          description="Impossible de charger les pré-dossiers pour le moment."
          retryHref="/admin/intake"
        />
      </main>
    );
  }

  const statusPriority: Record<string, number> = {
    student_question: 0,
    paid_pending_validation: 1,
    campus_review: 2,
    route_proposed: 3,
    payment_pending: 4,
    starter_documents: 5,
    procedure_created: 6,
  };
  const rows = [...(intakeCases || [])].sort((left, right) => {
    const priorityDelta =
      (statusPriority[left.status] ?? 99) - (statusPriority[right.status] ?? 99);
    if (priorityDelta !== 0) return priorityDelta;
    return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
  });
  const studentIds = rows.map((item) => item.student_id);
  const orientationIds = rows.map((item) => item.orientation_id);

  const [profilesResult, prospectsResult, documentsResult, orientationsResult, offersResult] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id,first_name,last_name,full_name").in("id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    studentIds.length
      ? supabase.from("prospects").select("user_id,email").in("user_id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    studentIds.length
      ? supabase
          .from("documents")
          .select("student_id,category,status,created_at")
          .in("student_id", studentIds)
          .in("category", ["passport", "baccalaureate", "transcripts", "language_certificate"])
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    orientationIds.length
      ? supabase
          .from("orientations")
          .select("id,input,created_at")
          .in("id", orientationIds)
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("commercial_offer_versions")
      .select("id,display_name,summary,service_items,price_minor,currency")
      .eq("status", "published")
      .order("price_minor", { ascending: true }),
  ]);

  if (
    profilesResult.error
    || prospectsResult.error
    || documentsResult.error
    || orientationsResult.error
    || offersResult.error
  ) {
    return (
      <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
        <AdminPageHeader
          section="Dossiers"
          title="Validation du parcours"
          description="Orientation, pièces de départ et décision Campus Allemagne."
        />
        <AdminLoadError
          title="Une partie du pré-dossier est indisponible"
          description="Réessayez avant de prendre une décision sur le parcours."
          retryHref="/admin/intake"
        />
      </main>
    );
  }

  const profileById = new Map((profilesResult.data || []).map((profile) => [profile.id, profile]));
  const emailByUserId = new Map((prospectsResult.data || []).map((prospect) => [prospect.user_id, prospect.email]));
  const orientationById = new Map((orientationsResult.data || []).map((orientation) => [orientation.id, orientation]));

  const cases = rows.flatMap((item) => {
    const profile = profileById.get(item.student_id);
    const orientation = orientationById.get(item.orientation_id);
    const input = orientation?.input && typeof orientation.input === "object"
      ? orientation.input as Record<string, unknown>
      : {};
    const answers = restorePublicOrientationAnswers(input.answers);
    const email = emailByUserId.get(item.student_id) || "";

    if (email.startsWith("erased-") || email.endsWith("@invalid.local")) {
      return [];
    }

    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ")
      || profile?.full_name
      || "Étudiant";

    return [{
      studentId: item.student_id,
      name,
      email,
      status: item.status,
      orientation: {
        targetDegree: answers.targetDegree,
        targetField: answers.targetField,
        germanLevel: answers.germanLevel,
        bacStatus: answers.bacStatus,
        savedAt: orientation?.created_at || "",
      },
      documents: (documentsResult.data || [])
        .filter((document) => document.student_id === item.student_id)
        .map((document) => ({
          category: document.category,
          status: document.status,
        })),
      proposedRouteKey: item.proposed_route_key,
      proposalReason: item.proposal_reason,
      proposedOfferVersionId: item.proposed_offer_version_id,
      purchaseId: item.purchase_id,
      studentResponseNote: item.student_response_note,
      studentRespondedAt: item.student_responded_at,
    }];
  });

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <AdminPageHeader
        section="Dossiers"
        title="Validation du parcours"
        description="Proposez un parcours et une offre. Les réponses étudiantes remontent ici ; l’acceptation ouvre le paiement, puis la phase suivante après validation Campus."
        actions={<Link href="/admin/accompagnement" className={buttonClassName("secondary", "px-4")}>Accompagnement de A à Z →</Link>}
      />
      <AdminIntakePanel
        cases={cases}
        offers={(offersResult.data || []).flatMap((offer) => {
          if (offer.price_minor === null || typeof offer.currency !== "string") return [];
          const priceMinor = Number(offer.price_minor);
          if (!Number.isSafeInteger(priceMinor) || priceMinor < 0) return [];

          return [{
            id: offer.id,
            displayName: offer.display_name,
            summary: offer.summary,
            services: serviceItems(offer.service_items),
            priceMinor,
            currency: offer.currency,
          }];
        })}
      />
    </main>
  );
}
