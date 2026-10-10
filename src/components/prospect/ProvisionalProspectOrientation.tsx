import Link from "next/link";
import { DossierHeader } from "@/components/product/DossierHeader";
import { buttonClassName } from "@/components/ui/Button";
import { getRequestLocale } from "@/lib/i18n-server";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { orientationProjectFacts } from "@/lib/prospect/orientation-presentation";
import type { ProvisionalIdentity } from "@/lib/prospect/provisional-auth";

export async function ProvisionalProspectOrientation({ identity }: { identity: ProvisionalIdentity }) {
  const locale = await getRequestLocale();
  const supabase = createPrivilegedSupabaseClient();
  const { data } = await supabase.from("orientations")
    .select("input").eq("id", identity.orientationId).maybeSingle();
  const input = data?.input && typeof data.input === "object" ? data.input as Record<string, unknown> : {};
  const answers = restorePublicOrientationAnswers(input.answers);
  const facts = orientationProjectFacts(answers, locale);
  const t = {
    fr: { title: "Mon orientation", subtitle: "Votre projet gratuit enregistré", next: "Préparer mes documents" },
    ar: { title: "توجيهي", subtitle: "مشروعك المجاني محفوظ", next: "تحضير وثائقي" },
    en: { title: "My orientation", subtitle: "Your saved free study project", next: "Prepare my documents" },
    de: { title: "Meine Orientierung", subtitle: "Dein gespeichertes Studienvorhaben", next: "Dokumente vorbereiten" },
  }[locale];
  return (
    <main className="space-y-5">
      <DossierHeader eyebrow={t.subtitle} title={t.title} facts={facts.map((fact, index) => ({
        label: String(index + 1), value: <bdi dir="auto">{fact}</bdi>,
      }))} />
      <div className="pc-panel p-5">
        <Link href="/prospect/documents" className={buttonClassName("primary")}>{t.next}</Link>
      </div>
    </main>
  );
}
