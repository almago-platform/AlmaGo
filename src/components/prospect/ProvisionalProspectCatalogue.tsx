import { ProvisionalProgrammeSearch, type ProvisionalProgramme } from "@/components/prospect/ProvisionalProgrammeSearch";
import { getRequestLocale } from "@/lib/i18n-server";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import type { OrientationProgrammeRecord } from "@/lib/orientation-engine/types";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";
import type { ProvisionalIdentity } from "@/lib/prospect/provisional-auth";

function safeOfficialSource(input: string | null | undefined) {
  if (!input) return null;
  try {
    const url = new URL(input);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export async function ProvisionalProspectCatalogue({
  identity,
  catalogue,
}: {
  identity: ProvisionalIdentity;
  catalogue: OrientationProgrammeRecord[];
}) {
  const locale = await getRequestLocale();
  const supabase = createPrivilegedSupabaseClient();
  const { data } = await supabase.from("orientations")
    .select("input").eq("id", identity.orientationId).maybeSingle();
  const input = data?.input && typeof data.input === "object" ? data.input as Record<string, unknown> : {};
  const answers = restorePublicOrientationAnswers(input.answers);
  const recommendations = prospectCatalogueRecommendations(answers, catalogue);
  const recommendedIds = new Set(recommendations.map((item) => item.programme.id));
  const ordered = [
    ...recommendations.map((item) => item.programme),
    ...catalogue.filter((item) => !recommendedIds.has(item.id)),
  ];
  const items: ProvisionalProgramme[] = ordered.slice(0, 60).map((programme) => ({
    id: programme.id,
    name: programme.name,
    university: programme.university.name,
    city: programme.university.city || "",
    field: programme.field || "",
    degree: programme.degreeLevel,
    language: programme.teachingLanguage || "",
    officialUrl: safeOfficialSource(programme.programmeSourceUrl),
    recommended: recommendedIds.has(programme.id),
  }));
  return <ProvisionalProgrammeSearch items={items} locale={locale} />;
}
