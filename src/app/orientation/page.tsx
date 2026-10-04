import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { PublicOrientationForm } from "@/components/orientation/PublicOrientationForm";
import { orientationCopy } from "@/content/orientation-copy";
import { LOCALE_COOKIE, normalizeLocale } from "@/lib/i18n";
import {
  restorePublicOrientationAnswers,
  restorePublicOrientationIdentity,
} from "@/lib/orientation/public";
import { getPublicOrigin } from "@/lib/public-origin";
import { getPhase2StudentAccess } from "@/lib/phase2/access";
import {
  isPhase2AttributionEnabled,
  normalizeAcquisitionContext,
} from "@/lib/phase2/acquisition";
import {
  isPhase2AccessEnabled,
  isPhase2AccountLinkingEnabled,
  isPhase2EmailDeliveryEnabled,
  isPhase2ProspectCaptureEnabled,
} from "@/lib/phase2/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const [store, publicOrigin] = await Promise.all([cookies(), getPublicOrigin()]);
  const locale = normalizeLocale(store.get(LOCALE_COOKIE)?.value);
  const copy = orientationCopy[locale];

  return {
    title: copy.intro.eyebrow,
    description: copy.intro.lead,
    alternates: {
      canonical: new URL("/orientation", publicOrigin).toString(),
    },
  };
}

function savedAnswers(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const answers = (input as Record<string, unknown>).answers;
  return answers ? restorePublicOrientationAnswers(answers) : null;
}

function savedIdentity(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const identity = (input as Record<string, unknown>).identity;
  return identity ? restorePublicOrientationIdentity(identity) : null;
}

export default async function OrientationPage({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string | string[];
    src?: string | string[];
    ref?: string | string[];
  }>;
}) {
  noStore();

  if (!isPhase2AccessEnabled()) notFound();

  const params = await searchParams;
  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const sourceKind = Array.isArray(params.src) ? params.src[0] : params.src;
  const sourceId = Array.isArray(params.ref) ? params.ref[0] : params.ref;
  const acquisitionContext = isPhase2AttributionEnabled()
    ? normalizeAcquisitionContext(sourceKind, sourceId)
    : null;

  if (mode !== "update") {
    const entryAccess = await getPhase2StudentAccess();
    const authenticatedProspect = Boolean(
      entryAccess.user
      && entryAccess.isStudent
      && entryAccess.phase2Enabled
      && !entryAccess.canUseClientFeatures
    );

    let initialIdentity = null;

    if (authenticatedProspect && entryAccess.user) {
      const { data: profile } = await entryAccess.supabase
        .from("profiles")
        .select("first_name,last_name")
        .eq("id", entryAccess.user.id)
        .maybeSingle();

      initialIdentity = {
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        birthDate: "",
        email: entryAccess.user.email || "",
      };
    }

    return (
      <PublicOrientationForm
        prospectCaptureEnabled={isPhase2ProspectCaptureEnabled()}
        emailDeliveryEnabled={isPhase2EmailDeliveryEnabled()}
        accountLinkingEnabled={isPhase2AccountLinkingEnabled() && !authenticatedProspect}
        initialIdentity={initialIdentity}
        acquisitionContext={acquisitionContext}
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
  const initialIdentity = savedIdentity(orientation.input);
  if (!initialAnswers) redirect("/prospect");

  return (
    <PublicOrientationForm
      initialAnswers={initialAnswers}
      initialIdentity={initialIdentity}
      authenticatedUpdate
    />
  );
}
