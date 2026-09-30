import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PublicOrientationForm } from "@/components/orientation/PublicOrientationForm";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import {
  isPhase2AccessEnabled,
  isPhase2EmailDeliveryEnabled,
  isPhase2ProspectCaptureEnabled,
} from "@/lib/phase2/config";

export const metadata: Metadata = {
  title: "Orientation gratuite",
  description: "Commencez votre projet d’études en Allemagne avec une orientation courte, sans compte.",
};

function savedAnswers(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const answers = (input as Record<string, unknown>).answers;
  return answers ? restorePublicOrientationAnswers(answers) : null;
}

export default async function OrientationPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string | string[] }>;
}) {
  if (!isPhase2AccessEnabled()) notFound();

  const params = await searchParams;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;

  if (mode !== "update") {
    return (
      <PublicOrientationForm
        prospectCaptureEnabled={isPhase2ProspectCaptureEnabled()}
        emailDeliveryEnabled={isPhase2EmailDeliveryEnabled()}
      />
    );
  }

  const access = await getPhase2StudentAccess();
  if (!access.user) redirect("/login");
  if (!access.isStudent) redirect("/unauthorized");
  if (access.canUseClientFeatures) redirect("/student");

  const { data: prospect } = await access.supabase
    .from("prospects")
    .select("id")
    .eq("user_id", access.user.id)
    .maybeSingle();

  if (!prospect?.id) redirect("/prospect");

  const { data: orientation } = await access.supabase
    .from("orientations")
    .select("engine_version,input")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!orientation || orientation.engine_version !== "public-orientation-v1") {
    redirect("/prospect");
  }

  const initialAnswers = savedAnswers(orientation.input);
  if (!initialAnswers) redirect("/prospect");

  return (
    <PublicOrientationForm
      initialAnswers={initialAnswers}
      authenticatedUpdate
    />
  );
}
