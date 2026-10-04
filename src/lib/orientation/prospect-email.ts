import "server-only";

import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";

type EmailCopy = {
  subject: string;
  intro: string;
  paths: string;
  orientationReportCta: string;
  candidateReportCta: string;
  reportsNote: string;
  accountCta: string;
  accountNote: string;
  interestCta: string;
  interestNote: string;
  disclaimer: string;
};

const emailCopy: Record<Locale, EmailCopy> = {
  fr: {
    subject: "Votre orientation Campus Allemagne",
    intro: "Votre dossier d’orientation est sauvegardé. Deux rapports sécurisés sont maintenant disponibles.",
    paths: "Pistes à explorer",
    orientationReportCta: "Orientation (PDF)",
    candidateReportCta: "Rapport candidat (PDF)",
    reportsNote: "Chaque lien ouvre un document sécurisé que vous pouvez enregistrer au format PDF.",
    accountCta: "Créer mon espace gratuit",
    accountNote: "La création du compte est facultative. L’orientation restera séparée de tout accompagnement payant.",
    interestCta: "Je veux continuer avec Campus Allemagne",
    interestNote: "Cette confirmation exprime votre intérêt pour la prochaine étape ou un futur pilote gratuit. Aucun paiement n’est demandé.",
    disclaimer: "Cette orientation organise votre recherche. Elle ne constitue ni une admission ni une décision de visa.",
  },
  ar: {
    subject: "توجيهك من Campus Allemagne",
    intro: "تم حفظ ملف التوجيه. أصبح تقريران آمنان متاحين الآن.",
    paths: "مسارات للاستكشاف",
    orientationReportCta: "التوجيه (PDF)",
    candidateReportCta: "تقرير المترشح (PDF)",
    reportsNote: "يفتح كل رابط مستندًا آمنًا يمكنك حفظه بصيغة PDF.",
    accountCta: "إنشاء مساحتي المجانية",
    accountNote: "إنشاء الحساب اختياري. يظل هذا التوجيه منفصلاً عن أي خدمة مرافقة مدفوعة.",
    interestCta: "أريد المتابعة مع Campus Allemagne",
    interestNote: "هذا التأكيد يعبّر عن اهتمامك بالمرحلة التالية أو ببرنامج تجريبي مجاني مستقبلاً. لا يُطلب أي دفع.",
    disclaimer: "هذا التوجيه ينظم بحثك ولا يمثل قرار قبول أو قرار تأشيرة.",
  },
  en: {
    subject: "Your Campus Allemagne orientation",
    intro: "Your orientation file has been saved. Two secure reports are now available.",
    paths: "Paths to explore",
    orientationReportCta: "Orientation (PDF)",
    candidateReportCta: "Candidate report (PDF)",
    reportsNote: "Each link opens a secure document that you can save as a PDF.",
    accountCta: "Create my free space",
    accountNote: "Creating an account is optional. This orientation remains separate from any paid support service.",
    interestCta: "I want to continue with Campus Allemagne",
    interestNote: "This confirmation expresses interest in the next step or a future free pilot. No payment is requested.",
    disclaimer: "This orientation structures your research. It is not an admission or visa decision.",
  },
  de: {
    subject: "Deine Campus Allemagne Orientierung",
    intro: "Deine Orientierungsakte wurde gespeichert. Zwei sichere Berichte stehen jetzt bereit.",
    paths: "Mögliche Wege",
    orientationReportCta: "Orientierung (PDF)",
    candidateReportCta: "Bewerberbericht (PDF)",
    reportsNote: "Jeder Link öffnet ein sicheres Dokument, das du als PDF speichern kannst.",
    accountCta: "Kostenlosen Bereich erstellen",
    accountNote: "Ein Konto ist freiwillig. Diese Orientierung bleibt von einer kostenpflichtigen Begleitung getrennt.",
    interestCta: "Ich möchte mit Campus Allemagne weitermachen",
    interestNote: "Diese Bestätigung zeigt dein Interesse am nächsten Schritt oder an einem zukünftigen kostenlosen Pilot. Es wird keine Zahlung verlangt.",
    disclaimer: "Diese Orientierung strukturiert deine Recherche. Sie ist keine Zulassungs- oder Visumentscheidung.",
  },
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildOrientationProspectEmail({
  locale,
  diagnostic,
  orientationReportUrl,
  candidateReportUrl,
  signupUrl,
  interestUrl,
}: {
  locale: Locale;
  diagnostic: PublicOrientationDiagnostic;
  orientationReportUrl: string;
  candidateReportUrl: string;
  signupUrl: string;
  interestUrl?: string | null;
}) {
  const copy = emailCopy[locale];
  const diagnosticCopy = orientationDiagnosticCopy[locale];
  const direction = locale === "ar" ? "rtl" : "ltr";
  const headline = diagnosticCopy.headlines[diagnostic.headlineCode];
  const pathTitles = diagnostic.paths
    .map((item) => diagnosticCopy.items[item.code]?.title)
    .filter((value): value is string => Boolean(value));

  const pathItems = pathTitles
    .map((title) => `<li style="margin:0 0 8px">${escapeHtml(title)}</li>`)
    .join("");

  const textPaths = pathTitles.map((title) => `- ${title}`).join("\n");

  return {
    subject: copy.subject,
    text: [
      copy.intro,
      "",
      headline.title,
      headline.body,
      "",
      copy.paths,
      textPaths,
      "",
      `${copy.orientationReportCta}: ${orientationReportUrl}`,
      `${copy.candidateReportCta}: ${candidateReportUrl}`,
      copy.reportsNote,
      "",
      `${copy.accountCta}: ${signupUrl}`,
      copy.accountNote,
      ...(interestUrl
        ? ["", `${copy.interestCta}: ${interestUrl}`, copy.interestNote]
        : []),
      "",
      copy.disclaimer,
    ].filter(Boolean).join("\n"),
    html: `<!doctype html>
<html lang="${locale}" dir="${direction}">
  <body style="margin:0;background:#f7f8fc;color:#182442;font-family:Arial,sans-serif">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px">
      <div style="background:#ffffff;border:1px solid #dfe3ec;border-radius:16px;padding:28px">
        <p style="margin:0 0 18px;font-size:14px;font-weight:700;color:#2349c9">Campus Allemagne</p>
        <p style="margin:0 0 22px;line-height:1.6">${escapeHtml(copy.intro)}</p>
        <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">${escapeHtml(headline.title)}</h1>
        <p style="margin:0 0 22px;line-height:1.6;color:#546078">${escapeHtml(headline.body)}</p>
        ${pathItems ? `<h2 style="margin:0 0 10px;font-size:16px">${escapeHtml(copy.paths)}</h2><ul style="margin:0 0 24px;padding-inline-start:22px;line-height:1.5">${pathItems}</ul>` : ""}
        <div style="margin:0 0 18px;padding:16px;border:1px solid #dfe3ec;border-radius:12px;background:#f8f6f1">
          <p style="margin:0 0 10px">
            <a href="${escapeHtml(orientationReportUrl)}" style="display:inline-block;background:#db0423;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(copy.orientationReportCta)}</a>
          </p>
          <p style="margin:0 0 10px">
            <a href="${escapeHtml(candidateReportUrl)}" style="display:inline-block;background:#182442;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(copy.candidateReportCta)}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#546078">${escapeHtml(copy.reportsNote)}</p>
        </div>
        <p style="margin:0 0 10px">
          <a href="${escapeHtml(signupUrl)}" style="font-weight:700;color:#2349c9">${escapeHtml(copy.accountCta)}</a>
        </p>
        <p style="margin:0 0 22px;font-size:13px;line-height:1.6;color:#546078">${escapeHtml(copy.accountNote)}</p>
        ${interestUrl ? `<div style="margin:0 0 22px;padding:18px;border:1px solid #eadbb7;border-radius:12px;background:#fff9eb">
          <p style="margin:0 0 12px"><a href="${escapeHtml(interestUrl)}" style="display:inline-block;background:#182442;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 16px;border-radius:10px">${escapeHtml(copy.interestCta)}</a></p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#182442">${escapeHtml(copy.interestNote)}</p>
        </div>` : ""}
        <p style="margin:0;border-top:1px solid #dfe3ec;padding-top:18px;font-size:12px;line-height:1.6;color:#546078">${escapeHtml(copy.disclaimer)}</p>
      </div>
    </div>
  </body>
</html>`,
  };
}
