import "server-only";

import { orientationDiagnosticCopy } from "@/content/orientation-diagnostic-copy";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationDiagnostic } from "@/lib/orientation/diagnostic";

type EmailCopy = {
  subject: string;
  greeting: string;
  intro: string;
  preparation: string;
  paths: string;
  orientationReportDescription: string;
  candidateReportDescription: string;
  orientationReportCta: string;
  candidateReportCta: string;
  reportsNote: string;
  attachmentsNote: string;
  interestCta: string;
  interestNote: string;
  closing: string;
  signature: string;
  contact: string;
  disclaimer: string;
};

const emailCopy: Record<Locale, EmailCopy> = {
  fr: {
    subject: "Votre orientation Campus Allemagne est prête",
    greeting: "Bonjour,",
    intro: "Félicitations, votre orientation personnalisée pour votre projet d’études en Allemagne est maintenant prête.",
    preparation: "Nous avons analysé les informations de votre profil afin de vous proposer une première direction claire pour la suite de votre parcours.",
    paths: "Pistes à explorer",
    orientationReportDescription: "Votre rapport d’orientation contient votre recommandation principale, les pistes d’études retenues, les programmes à explorer, vos priorités et les prochaines étapes.",
    candidateReportDescription: "Votre rapport candidat reprend les informations principales de votre profil : parcours scolaire, langues, projet d’études, budget et préférences.",
    orientationReportCta: "Voir mon orientation PDF",
    candidateReportCta: "Voir mon rapport candidat PDF",
    reportsNote: "Vous pouvez consulter et enregistrer ces deux rapports en PDF grâce aux boutons ci-dessous.",
    attachmentsNote: "Les deux rapports sont également joints à cet e-mail au format PDF.",
    interestCta: "Je veux continuer avec Campus Allemagne",
    interestNote: "Cette confirmation exprime votre intérêt pour la prochaine étape ou un futur pilote gratuit. Aucun paiement n’est demandé.",
    closing: "Votre projet commence à prendre forme. Nous avancerons avec vous étape par étape pour préparer la suite de votre dossier.",
    signature: "L’équipe Campus Allemagne",
    contact: "contact@campus-allemagne.info",
    disclaimer: "Ce rapport constitue une orientation personnalisée basée sur les informations que vous avez fournies. Il ne constitue pas une garantie d’admission, de visa ou d’inscription universitaire.",
  },
  ar: {
    subject: "توجيهك من Campus Allemagne جاهز",
    greeting: "مرحبًا،",
    intro: "تهانينا، أصبح توجيهك الشخصي لمشروع الدراسة في ألمانيا جاهزًا الآن.",
    preparation: "قمنا بتحليل معلومات ملفك لنقدم لك اتجاهًا أوليًا واضحًا للخطوات القادمة في مسارك.",
    paths: "مسارات للاستكشاف",
    orientationReportDescription: "يتضمن تقرير التوجيه توصيتك الرئيسية والمسارات الدراسية المقترحة والبرامج التي يمكنك استكشافها وأولوياتك والخطوات القادمة.",
    candidateReportDescription: "يلخص تقرير المترشح أهم معلومات ملفك: المسار الدراسي واللغات ومشروع الدراسة والميزانية والتفضيلات.",
    orientationReportCta: "التوجيه (PDF)",
    candidateReportCta: "تقرير المترشح (PDF)",
    reportsNote: "يفتح كل رابط مستندًا آمنًا يمكنك حفظه بصيغة PDF.",
    attachmentsNote: "ستجد أيضًا التقريرين مرفقين بهذا البريد الإلكتروني بصيغة PDF.",
    interestCta: "أريد المتابعة مع Campus Allemagne",
    interestNote: "هذا التأكيد يعبّر عن اهتمامك بالمرحلة التالية أو ببرنامج تجريبي مجاني مستقبلاً. لا يُطلب أي دفع.",
    closing: "بدأ مشروعك يتضح أكثر. سنواصل معك خطوة بخطوة للتحضير للمرحلة التالية من ملفك.",
    signature: "فريق Campus Allemagne",
    contact: "contact@campus-allemagne.info",
    disclaimer: "هذا التقرير توجيه شخصي مبني على المعلومات التي قدمتها. وهو لا يمثل ضمانًا للقبول أو التأشيرة أو التسجيل الجامعي.",
  },
  en: {
    subject: "Your Campus Allemagne orientation is ready",
    greeting: "Hello,",
    intro: "Congratulations, your personalised orientation for your study project in Germany is now ready.",
    preparation: "We analysed the information in your profile to give you a clear first direction for the next stage of your journey.",
    paths: "Paths to explore",
    orientationReportDescription: "Your orientation report contains your main recommendation, selected study paths, programmes to explore, priorities and next steps.",
    candidateReportDescription: "Your candidate report summarises the key information in your profile: education, languages, study project, budget and preferences.",
    orientationReportCta: "Orientation (PDF)",
    candidateReportCta: "Candidate report (PDF)",
    reportsNote: "Each link opens a secure document that you can save as a PDF.",
    attachmentsNote: "Both reports are also attached to this email as PDF files.",
    interestCta: "I want to continue with Campus Allemagne",
    interestNote: "This confirmation expresses interest in the next step or a future free pilot. No payment is requested.",
    closing: "Your project is starting to take shape. We will continue step by step to prepare the next stage of your application.",
    signature: "The Campus Allemagne team",
    contact: "contact@campus-allemagne.info",
    disclaimer: "This report is a personalised orientation based on the information you provided. It is not a guarantee of admission, visa approval or university enrolment.",
  },
  de: {
    subject: "Deine Campus Allemagne Orientierung ist bereit",
    greeting: "Hallo,",
    intro: "Glückwunsch, deine persönliche Orientierung für dein Studienprojekt in Deutschland ist jetzt fertig.",
    preparation: "Wir haben die Angaben in deinem Profil ausgewertet, um dir eine klare erste Richtung für die nächsten Schritte zu geben.",
    paths: "Mögliche Wege",
    orientationReportDescription: "Dein Orientierungsbericht enthält deine wichtigste Empfehlung, passende Studienwege, Programme zur weiteren Prüfung, Prioritäten und nächste Schritte.",
    candidateReportDescription: "Dein Bewerberbericht fasst die wichtigsten Angaben deines Profils zusammen: Ausbildung, Sprachen, Studienprojekt, Budget und Präferenzen.",
    orientationReportCta: "Orientierung (PDF)",
    candidateReportCta: "Bewerberbericht (PDF)",
    reportsNote: "Jeder Link öffnet ein sicheres Dokument, das du als PDF speichern kannst.",
    attachmentsNote: "Beide Berichte sind dieser E-Mail zusätzlich als PDF-Dateien beigefügt.",
    interestCta: "Ich möchte mit Campus Allemagne weitermachen",
    interestNote: "Diese Bestätigung zeigt dein Interesse am nächsten Schritt oder an einem zukünftigen kostenlosen Pilot. Es wird keine Zahlung verlangt.",
    closing: "Dein Projekt nimmt Form an. Wir gehen die nächsten Schritte gemeinsam und bereiten die weitere Bearbeitung deines Dossiers vor.",
    signature: "Das Campus Allemagne Team",
    contact: "contact@campus-allemagne.info",
    disclaimer: "Dieser Bericht ist eine persönliche Orientierung auf Grundlage deiner Angaben. Er ist keine Garantie für Zulassung, Visum oder Einschreibung.",
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
  interestUrl,
  attachmentsIncluded = false,
}: {
  locale: Locale;
  diagnostic: PublicOrientationDiagnostic;
  orientationReportUrl: string;
  candidateReportUrl: string;
  interestUrl?: string | null;
  attachmentsIncluded?: boolean;
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
      copy.greeting,
      "",
      copy.intro,
      copy.preparation,
      "",
      headline.title,
      headline.body,
      "",
      copy.paths,
      textPaths,
      "",
      copy.orientationReportDescription,
      `${copy.orientationReportCta}: ${orientationReportUrl}`,
      "",
      copy.candidateReportDescription,
      `${copy.candidateReportCta}: ${candidateReportUrl}`,
      copy.reportsNote,
      ...(attachmentsIncluded ? [copy.attachmentsNote] : []),
      "",
      ...(interestUrl
        ? ["", `${copy.interestCta}: ${interestUrl}`, copy.interestNote]
        : []),
      "",
      copy.closing,
      "",
      copy.signature,
      copy.contact,
      "",
      copy.disclaimer,
    ].filter(Boolean).join("\n"),
    html: `<!doctype html>
<html lang="${locale}" dir="${direction}">
  <body style="margin:0;background:#f7f8fc;color:#182442;font-family:Arial,sans-serif">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px">
      <div style="background:#ffffff;border:1px solid #dfe3ec;border-radius:16px;padding:28px">
        <p style="margin:0 0 18px;font-size:14px;font-weight:700;color:#2349c9">Campus Allemagne</p>
        <p style="margin:0 0 10px;line-height:1.6">${escapeHtml(copy.greeting)}</p>
        <p style="margin:0 0 10px;line-height:1.6;font-weight:700">${escapeHtml(copy.intro)}</p>
        <p style="margin:0 0 22px;line-height:1.6">${escapeHtml(copy.preparation)}</p>
        <h1 style="margin:0 0 8px;font-size:22px;line-height:1.3">${escapeHtml(headline.title)}</h1>
        <p style="margin:0 0 22px;line-height:1.6;color:#546078">${escapeHtml(headline.body)}</p>
        ${pathItems ? `<h2 style="margin:0 0 10px;font-size:16px">${escapeHtml(copy.paths)}</h2><ul style="margin:0 0 24px;padding-inline-start:22px;line-height:1.5">${pathItems}</ul>` : ""}
        <div style="margin:0 0 18px;padding:16px;border:1px solid #dfe3ec;border-radius:12px;background:#f8f6f1">
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#182442">${escapeHtml(copy.orientationReportDescription)}</p>
          <p style="margin:0 0 14px">
            <a href="${escapeHtml(orientationReportUrl)}" style="display:inline-block;background:#db0423;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(copy.orientationReportCta)}</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#182442">${escapeHtml(copy.candidateReportDescription)}</p>
          <p style="margin:0 0 14px">
            <a href="${escapeHtml(candidateReportUrl)}" style="display:inline-block;background:#182442;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:10px">${escapeHtml(copy.candidateReportCta)}</a>
          </p>
          <p style="margin:0;font-size:12px;line-height:1.6;color:#546078">${escapeHtml(copy.reportsNote)}</p>
          ${attachmentsIncluded ? `<p style="margin:8px 0 0;font-size:12px;line-height:1.6;font-weight:700;color:#182442">${escapeHtml(copy.attachmentsNote)}</p>` : ""}
        </div>
        ${interestUrl ? `<div style="margin:0 0 22px;padding:18px;border:1px solid #eadbb7;border-radius:12px;background:#fff9eb">
          <p style="margin:0 0 12px"><a href="${escapeHtml(interestUrl)}" style="display:inline-block;background:#182442;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 16px;border-radius:10px">${escapeHtml(copy.interestCta)}</a></p>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#182442">${escapeHtml(copy.interestNote)}</p>
        </div>` : ""}
        <p style="margin:0 0 16px;line-height:1.6">${escapeHtml(copy.closing)}</p>
        <p style="margin:0 0 4px;font-weight:700">${escapeHtml(copy.signature)}</p>
        <p style="margin:0 0 18px;font-size:13px;color:#546078">${escapeHtml(copy.contact)}</p>
        <p style="margin:0;border-top:1px solid #dfe3ec;padding-top:18px;font-size:12px;line-height:1.6;color:#546078">${escapeHtml(copy.disclaimer)}</p>
      </div>
    </div>
  </body>
</html>`,
  };
}
