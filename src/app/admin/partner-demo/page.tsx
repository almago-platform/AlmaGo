import { notFound } from "next/navigation";
import { PartnerPaymentSandbox } from "@/components/admin/PartnerPaymentSandbox";
import { buildPublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";
import { buildOrientationProspectEmail } from "@/lib/orientation/prospect-email";
import { isPartnerPrelaunchModeEnabled } from "@/lib/prelaunch";

export const dynamic = "force-dynamic";

const demoAnswers = {
  bacStatus: "obtained" as const,
  bacYear: "2026",
  bacTrack: "Mathématiques",
  generalAverage: "14.50",
  averageType: "official" as const,
  lastDiploma: "Baccalauréat",
  higherEducationStatus: "not_started" as const,
  currentStudyField: "",
  universitySemesters: "",
  studyIntent: "" as const,
  targetSpecialization: "",
  targetDegree: "Bachelor",
  targetField: "Informatique",
  engineeringSpecialty: "",
  scienceSpecialty: "" as const,
  germanLevel: "B1",
  englishLevel: "B2",
  studyLanguage: "Allemand",
  targetIntakeSeason: "" as const,
  targetIntakeYear: "",
  budgetRange: "800–1 000 € / mois",
  preferredCities: ["Aachen"],
};

function preview(locale: "fr" | "ar") {
  const diagnostic = buildPublicOrientationDiagnostic(demoAnswers);
  return buildOrientationProspectEmail({
    locale,
    diagnostic,
    reportUrl: "https://partner-demo.invalid/orientation/report/demo-token",
    signupUrl: "https://partner-demo.invalid/signup?orientation_token=demo-token",
  });
}

export default function PartnerDemoPage() {
  if (!isPartnerPrelaunchModeEnabled()) notFound();

  const french = preview("fr");
  const arabic = preview("ar");

  return (
    <main className="mx-auto w-full max-w-[92rem] px-4 py-5 sm:px-6 sm:py-6 xl:px-8">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
          Partner-Ready
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--foreground)]">
          Démonstration partenaires
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Cette zone présente les intégrations e-mail et paiement sans envoyer d’e-mail,
          sans encaisser d’argent et sans écrire de donnée commerciale.
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-2" aria-label="Aperçus e-mail transactionnel">
        <EmailPreview
          title="E-mail d’orientation — français"
          subject={french.subject}
          html={french.html}
          language="fr"
        />
        <EmailPreview
          title="رسالة التوجيه — العربية"
          subject={arabic.subject}
          html={arabic.html}
          language="ar"
        />
      </section>

      <div className="mt-6">
        <PartnerPaymentSandbox />
      </div>

      <section className="mt-6 rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface-subtle)] p-5 text-sm leading-6 text-[var(--foreground)]">
        <h2 className="font-bold text-[var(--foreground)]">Garde-fous de cette démonstration</h2>
        <ul className="mt-3 list-disc space-y-1 ps-5">
          <li>liens e-mail factices sur le domaine réservé <code>.invalid</code> ;</li>
          <li>aucun appel à Resend ou à un autre fournisseur e-mail ;</li>
          <li>aucun checkout, webhook ou prestataire de paiement ;</li>
          <li>aucune modification de <code>customer_access</code> ou des tables paiement ;</li>
          <li>le mode Partner-Ready reste obligatoire pour afficher cette page.</li>
        </ul>
      </section>
    </main>
  );
}

function EmailPreview({
  title,
  subject,
  html,
  language,
}: {
  title: string;
  subject: string;
  html: string;
  language: "fr" | "ar";
}) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{title}</p>
        <p className="mt-2 text-sm font-bold text-[var(--foreground)]">
          Objet : <bdi dir="auto">{subject}</bdi>
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">Aperçu local uniquement — aucun envoi</p>
      </div>
      <iframe
        title={title}
        lang={language}
        dir={language === "ar" ? "rtl" : "ltr"}
        sandbox=""
        srcDoc={html}
        className="h-[36rem] w-full bg-white"
      />
    </article>
  );
}
