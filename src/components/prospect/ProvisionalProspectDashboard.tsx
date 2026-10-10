import Link from "next/link";
import { DossierHeader } from "@/components/product/DossierHeader";
import { JourneyRail, type JourneyRailStep } from "@/components/product/JourneyRail";
import { NextActionPanel } from "@/components/product/NextActionPanel";
import { PremiumSectionHeader } from "@/components/product/PremiumSectionHeader";
import { ProspectProgrammeRecommendationCard } from "@/components/prospect/ProspectProgrammeRecommendationCard";
import { buttonClassName } from "@/components/ui/Button";
import { prospectHubCopy } from "@/content/prospect-hub-copy";
import { getRequestLocale } from "@/lib/i18n-server";
import { restorePublicOrientationAnswers } from "@/lib/orientation/public";
import { loadVerifiedProgrammeCatalogue } from "@/lib/orientation-engine/catalog";
import { createPrivilegedSupabaseClient } from "@/lib/supabase/privileged";
import { orientationProjectFacts } from "@/lib/prospect/orientation-presentation";
import { prospectCatalogueRecommendations } from "@/lib/prospect/programmes";
import { prospectMedia } from "@/lib/prospect/media";
import type { ProvisionalIdentity } from "@/lib/prospect/provisional-auth";

/**
 * The actual Prospect dashboard component system (hero, journey, action,
 * recommendations) backed only by the pending identity's orientation UUID.
 * This is NOT a Supabase session and cannot inspect client/paid records.
 */
export async function ProvisionalProspectDashboard({ identity }: { identity: ProvisionalIdentity }) {
  const locale = await getRequestLocale();
  const supabase = createPrivilegedSupabaseClient();
  const [{ data: orientation }, catalogue] = await Promise.all([
    supabase.from("orientations").select("input")
      .eq("id", identity.orientationId).maybeSingle(),
    loadVerifiedProgrammeCatalogue().catch(() => []),
  ]);
  const input = orientation?.input && typeof orientation.input === "object"
    ? orientation.input as Record<string, unknown> : {};
  const answers = restorePublicOrientationAnswers(input.answers);
  const t = prospectHubCopy[locale].dashboard;
  const catalogueCopy = prospectHubCopy[locale].catalogue;
  const facts = orientationProjectFacts(answers, locale);
  const recommendations = prospectCatalogueRecommendations(answers, catalogue).slice(0, 3);
  const labels = {
    projectMatch: catalogueCopy.projectMatch,
    preferredCity: catalogueCopy.preferredCity,
    requirementCheck: catalogueCopy.requirementCheck,
    field: catalogueCopy.field,
    german: catalogueCopy.german,
    uniAssist: catalogueCopy.uniAssist,
    yes: catalogueCopy.yes,
    source: catalogueCopy.source,
    applyLink: catalogueCopy.applyLink,
  };
  const l = {
    fr: { pending: "E-mail à confirmer", orient: "Orientation", doc: "Documents", review: "Analyse Campus", proposal: "Proposition", payment: "Paiement", student: "Étudiant", done: "Terminé", next: "À préparer", locked: "Après validation", title: "Préparer mes documents", text: "Vous pouvez préparer votre pré-dossier. Les démarches payantes nécessitent la confirmation de l'adresse e-mail et une validation séparée." },
    ar: { pending: "البريد غير مؤكد", orient: "التوجيه", doc: "الوثائق", review: "مراجعة Campus", proposal: "العرض", payment: "الدفع", student: "الطالب", done: "مكتمل", next: "الخطوة التالية", locked: "بعد التأكيد", title: "تحضير وثائقي", text: "يمكنك إعداد ملفك المجاني. الخطوات المدفوعة تتطلب تأكيد البريد وموافقة منفصلة." },
    en: { pending: "Email not confirmed", orient: "Orientation", doc: "Documents", review: "Campus review", proposal: "Proposal", payment: "Payment", student: "Student", done: "Done", next: "Next step", locked: "After verification", title: "Prepare my documents", text: "You may prepare your free dossier. Paid steps require email verification and separate approval." },
    de: { pending: "E-Mail nicht bestätigt", orient: "Orientierung", doc: "Dokumente", review: "Campus-Prüfung", proposal: "Angebot", payment: "Zahlung", student: "Studierende", done: "Abgeschlossen", next: "Nächster Schritt", locked: "Nach Bestätigung", title: "Dokumente vorbereiten", text: "Du kannst dein kostenloses Dossier vorbereiten. Kostenpflichtige Schritte erfordern E-Mail-Bestätigung und gesonderte Freigabe." },
  }[locale];
  const steps: JourneyRailStep[] = [
    { label: l.orient, detail: l.done, status: "done", href: "/prospect/orientation" },
    { label: l.doc, detail: l.next, status: "active", href: "/prospect/documents" },
    { label: l.review, detail: l.locked, status: "locked" },
    { label: l.proposal, detail: l.locked, status: "locked" },
    { label: l.payment, detail: l.locked, status: "locked" },
    { label: l.student, detail: l.locked, status: "locked" },
  ];
  return (
    <main className="space-y-5">
      <DossierHeader
        eyebrow={locale === "fr" ? "ESPACE PROSPECT" : "PROSPECT"}
        title={t.title}
        description={t.subtitle}
        status={l.pending}
        statusVariant="warning"
        facts={facts.slice(0, 4).map((fact, index) => ({
          label: index === 0 ? t.project : l.orient,
          value: <bdi dir="auto">{fact}</bdi>,
        }))}
        imageSrc={prospectMedia.dashboardHero}
        imagePriority
      />
      <section className="space-y-3">
        <PremiumSectionHeader eyebrow={t.progress} title={t.progress} />
        <JourneyRail steps={steps} />
      </section>
      <NextActionPanel
        eyebrow={t.nextAction}
        title={l.title}
        description={l.text}
        action={<Link href="/prospect/documents" className={buttonClassName("primary")}>{l.title}</Link>}
      />
      {recommendations.length > 0 ? (
        <section className="pc-panel pc-premium-card pc-theme-gold p-4 sm:p-5">
          <PremiumSectionHeader eyebrow={catalogueCopy.projectMatch} title={t.recommendedTitle}
            actions={<Link href="/prospect/catalogue" className={buttonClassName("secondary")}>{t.recommendedViewAll}</Link>}
          />
          <div className="mt-4 grid items-start gap-3 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <ProspectProgrammeRecommendationCard
                key={recommendation.programme.id}
                recommendation={recommendation} labels={labels} locale={locale} compact
              />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
