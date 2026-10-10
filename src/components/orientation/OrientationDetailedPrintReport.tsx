"use client";

import "./OrientationDetailedPrintReport.css";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { useOrientationUniversityMedia, universityPhotoKey } from "@/components/orientation/useOrientationUniversityMedia";
import { findCuratedUniversityMedia } from "@/lib/orientation-engine/discovery/curated-university-media";
import { orientationCandidatePriority } from "@/lib/orientation-engine/writer/candidate-priority";
import { formatPersonalizedFactValue } from "@/components/orientation/OrientationOnePagePrintReport";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers, PublicOrientationIdentity } from "@/lib/orientation/public";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";

const copy = {
  fr: {
    eyebrow: "Dossier d'orientation personnalisé",
    title: "Votre projet d'études en Allemagne",
    subtitle: "Les formations proposées, votre priorité et les étapes à préparer avec Campus Allemagne.",
    profile: "Votre profil", degree: "Diplôme visé", field: "Domaine", german: "Allemand",
    priority: "Votre priorité maintenant", next: "Votre première action",
    programmes: "Vos formations à explorer", programmeIntro: "Ces pistes proviennent de votre orientation. Elles ne constituent pas des admissions garanties.",
    verified: "Informations vérifiées", reviewing: "À vérifier avec l'université",
    why: "Pourquoi cette piste", facts: "Repères vérifiés", sources: "Sources des informations",
    missingPhoto: "Photo d'université non disponible avec une licence vérifiée",
    photo: "Photo de l'université", photoCredit: "Photo",
    roadmap: "Vos prochaines étapes", campus: "L'accompagnement Campus Allemagne",
    continue: "Continuer mon projet avec Campus Allemagne", caution: "Important",
    disclaimer: "Ce dossier est une aide à la préparation. Seules les universités décident de l'admission et les autorités compétentes décident du visa. Les conditions et dates doivent être revérifiées avant de candidater.",
    noVerifiedFacts: "Les conditions détaillées restent à vérifier auprès de l'université.",
    factNames: { degree_level: "Diplôme", teaching_language: "Langue d'enseignement", intake_terms: "Rentrée", application_route: "Candidature", german_language_requirement: "Allemand requis", english_language_requirement: "Anglais requis", tuition_or_semester_fees: "Frais", winter_deadline: "Date limite (hiver)", summer_deadline: "Date limite (été)" },
  },
  ar: {
    eyebrow: "ملف توجيه شخصي", title: "مشروعك للدراسة في ألمانيا",
    subtitle: "التخصصات المقترحة وأولويتك الحالية والخطوات التي يمكنك إعدادها مع Campus Allemagne.",
    profile: "ملفك", degree: "الدرجة المطلوبة", field: "المجال", german: "الألمانية",
    priority: "أولويتك الآن", next: "أول خطوة لك", programmes: "برامج تستحق الاستكشاف",
    programmeIntro: "هذه مسارات ناتجة عن توجيهك ولا تعني ضمان القبول.",
    verified: "معلومات موثقة", reviewing: "يلزم التحقق من الجامعة",
    why: "لماذا هذا المسار", facts: "معلومات موثقة", sources: "مصادر المعلومات",
    missingPhoto: "لا تتوفر صورة للجامعة بترخيص موثق", photo: "صورة الجامعة", photoCredit: "الصورة",
    roadmap: "خطواتك القادمة", campus: "مرافقة Campus Allemagne",
    continue: "متابعة مشروعي مع Campus Allemagne", caution: "مهم",
    disclaimer: "هذا الملف يساعد على التحضير، ولا يضمن القبول. الجامعة هي التي تقرر القبول، والجهات المختصة هي التي تقرر التأشيرة. تحقق من الشروط والمواعيد قبل التقديم.",
    noVerifiedFacts: "يجب التحقق من شروط البرنامج لدى الجامعة.",
    factNames: { degree_level: "الدرجة", teaching_language: "لغة الدراسة", intake_terms: "بداية الدراسة", application_route: "التقديم", german_language_requirement: "الألمانية المطلوبة", english_language_requirement: "الإنجليزية المطلوبة", tuition_or_semester_fees: "الرسوم", winter_deadline: "آخر أجل (شتاء)", summer_deadline: "آخر أجل (صيف)" },
  },
  en: {
    eyebrow: "Personalised orientation dossier", title: "Your study project in Germany",
    subtitle: "The suggested programmes, your current priority, and the next steps with Campus Allemagne.",
    profile: "Your profile", degree: "Target degree", field: "Field", german: "German",
    priority: "Your priority now", next: "Your first action", programmes: "Programmes to explore",
    programmeIntro: "These options come from your orientation. They are not guaranteed admissions.",
    verified: "Verified information", reviewing: "University confirmation needed",
    why: "Why this option", facts: "Verified facts", sources: "Information sources",
    missingPhoto: "No university photograph with a verified licence available",
    photo: "University photograph", photoCredit: "Photo",
    roadmap: "Your next steps", campus: "Campus Allemagne support",
    continue: "Continue with Campus Allemagne", caution: "Important",
    disclaimer: "This dossier helps you prepare; universities decide admissions and the competent authorities decide visas. Recheck conditions and deadlines before applying.",
    noVerifiedFacts: "Detailed conditions still require confirmation with the university.",
    factNames: { degree_level: "Degree", teaching_language: "Teaching language", intake_terms: "Intake", application_route: "Application", german_language_requirement: "German requirement", english_language_requirement: "English requirement", tuition_or_semester_fees: "Fees", winter_deadline: "Winter deadline", summer_deadline: "Summer deadline" },
  },
  de: {
    eyebrow: "Persönliches Orientierungsdossier", title: "Dein Studienprojekt in Deutschland",
    subtitle: "Studiengänge, deine aktuelle Priorität und die nächsten Schritte mit Campus Allemagne.",
    profile: "Dein Profil", degree: "Studienabschluss", field: "Fachgebiet", german: "Deutsch",
    priority: "Deine Priorität jetzt", next: "Dein erster Schritt", programmes: "Studiengänge zum Prüfen",
    programmeIntro: "Diese Vorschläge stammen aus deiner Orientierung und sind keine Zulassungsgarantie.",
    verified: "Geprüfte Informationen", reviewing: "Noch mit der Hochschule zu prüfen",
    why: "Warum diese Option", facts: "Geprüfte Fakten", sources: "Informationsquellen",
    missingPhoto: "Kein Hochschulfoto mit geprüfter Lizenz verfügbar",
    photo: "Hochschulfoto", photoCredit: "Foto",
    roadmap: "Deine nächsten Schritte", campus: "Begleitung durch Campus Allemagne",
    continue: "Projekt mit Campus Allemagne fortsetzen", caution: "Wichtig",
    disclaimer: "Dieses Dossier dient der Vorbereitung. Hochschulen entscheiden über Zulassungen, die zuständigen Behörden über Visa. Bedingungen und Fristen vor einer Bewerbung erneut prüfen.",
    noVerifiedFacts: "Die genauen Voraussetzungen sind noch mit der Hochschule zu klären.",
    factNames: { degree_level: "Abschluss", teaching_language: "Unterrichtssprache", intake_terms: "Studienbeginn", application_route: "Bewerbung", german_language_requirement: "Deutsch", english_language_requirement: "Englisch", tuition_or_semester_fees: "Gebühren", winter_deadline: "Winterfrist", summer_deadline: "Sommerfrist" },
  },
} as const;

function licensedPhoto(media: OrientationUniversityMedia | null | undefined): OrientationUniversityMedia | null {
  if (!media?.coverImageUrl || !media.coverImageSourceUrl || !media.coverImageLicense) return null;
  if (!/^https:\/\//i.test(media.coverImageUrl) || !/^https:\/\//i.test(media.coverImageSourceUrl)) return null;
  if (!/^(?:CC0(?:\s|$)|CC BY(?:-SA)?(?:\s|$))/i.test(media.coverImageLicense)) return null;
  return media;
}

function safeSource(url: string | null): string | null {
  return url && /^https:\/\//i.test(url) ? url : null;
}

export function OrientationDetailedPrintReport({
  answers, locale, personalized, identity = null,
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
  personalized: OrientationPublicPersonalizedResult;
  identity?: PublicOrientationIdentity | null;
}) {
  const t = copy[locale];
  const priority = orientationCandidatePriority(answers, locale);
  const selected = [...personalized.selected].sort((a, b) => a.position - b.position);
  const dynamicMedia = useOrientationUniversityMedia(selected.filter((option) => !option.universityMedia?.coverImageUrl)
    .map((option) => ({ institution: option.institution, city: option.city })));
  const content = personalized.content;
  const candidate = [identity?.firstName, identity?.lastName].filter(Boolean).join(" ");
  const prioritized = [
    [t.degree, answers.targetDegree || "—"],
    [t.field, answers.targetField || "—"],
    [t.german, answers.germanLevel || "—"],
  ];
  return (
    <article className="orientation-detailed-print-report" aria-label={t.eyebrow} dir={locale === "ar" ? "rtl" : "ltr"}>
      <section className="orientation-detail-cover">
        <header className="orientation-detail-header">
          <BrandLogo className="h-12 w-auto" priority />
          <span>{t.eyebrow}</span>
        </header>
        <div className="orientation-detail-hero">
          <p className="orientation-detail-eyebrow">Campus Allemagne</p>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <p className="orientation-detail-opening">{content.opening}</p>
        </div>
        <section className="orientation-detail-profile">
          <h2>{t.profile}{candidate ? ": " + candidate : ""}</h2>
          <dl>
            {prioritized.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </section>
        <section className="orientation-detail-priority">
          <p className="orientation-detail-eyebrow">{t.priority}</p>
          <h2>{priority?.title || content.mainPriority.title}</h2>
          <p>{priority?.text || content.mainPriority.text}</p>
          <strong>{t.next}: {priority?.yourStep || content.mainPriority.nextStep}</strong>
        </section>
        <section className="orientation-detail-roadmap">
          <h2>{t.roadmap}</h2>
          <ol>
            {content.roadmap.map((step, index) => (
              <li key={step.id}>
                <strong>{String(index + 1).padStart(2, "0")} · {step.label}</strong>
                <p>{index === 0 && priority ? priority.yourStep : step.text}</p>
              </li>
            ))}
          </ol>
        </section>
      </section>

      <section className="orientation-detail-programmes">
        <header className="orientation-detail-chapter">
          <p className="orientation-detail-eyebrow">{t.eyebrow}</p>
          <h2>{t.programmes}</h2>
          <p>{t.programmeIntro}</p>
        </header>
        {selected.map((option, index) => {
          const writer = content.studyOptions.find((item) => item.optionId === option.optionId)
            || content.studyOptions.find((item) => item.position === option.position);
          const photo = licensedPhoto(option.universityMedia)
            || licensedPhoto(dynamicMedia[universityPhotoKey(option.institution, option.city)])
            || licensedPhoto(findCuratedUniversityMedia(option.institution, option.city));
          const verifiedFacts = option.facts.filter((fact) => fact.status === "verified");
          const references = [...new Set(verifiedFacts.map((fact) => safeSource(fact.sourceUrl)).filter((url): url is string => Boolean(url)))];
          const why = writer?.whyItFits?.split(/première estimation campus allemagne|first campus allemagne estimate|erste einschätzung campus allemagne|تقدير أولي من campus allemagne/i)[0].trim();
          return (
            <article key={option.optionId} className="orientation-detail-option">
              <div className="orientation-detail-option-head">
                <span className="orientation-detail-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{option.programme}</h3>
                  <p>{option.institution}{option.city ? " · " + option.city : ""}</p>
                </div>
                <span className="orientation-detail-status">
                  {option.overallStatus === "verified" ? t.verified : t.reviewing}
                </span>
              </div>
              {photo ? (
                <figure className="orientation-detail-photo">
                  {/* The only permitted images have explicit reusable Creative Commons metadata. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.coverImageUrl || ""} alt={t.photo + ": " + option.institution} width={920} height={430} loading="eager" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
                  <figcaption>{t.photoCredit}: {photo.coverImageAttribution || option.institution} · {photo.coverImageLicense} · <a href={photo.coverImageSourceUrl || "#"} target="_blank" rel="noopener noreferrer">{photo.coverImageSourceUrl}</a></figcaption>
                </figure>
              ) : (
                <p className="orientation-detail-photo-missing">{t.missingPhoto}</p>
              )}
              {why ? (
                <div className="orientation-detail-why"><h4>{t.why}</h4><p>{why}</p></div>
              ) : null}
              <div className="orientation-detail-facts">
                <h4>{t.facts}</h4>
                {verifiedFacts.length ? (
                  <dl>
                    {verifiedFacts.map((fact) => (
                      <div key={fact.field}>
                        <dt>{(t.factNames as Record<string, string>)[fact.field] || fact.field}</dt>
                        <dd>{formatPersonalizedFactValue(fact, locale)}</dd>
                      </div>
                    ))}
                  </dl>
                ) : <p>{t.noVerifiedFacts}</p>}
              </div>
              {references.length ? (
                <div className="orientation-detail-sources">
                  <h4>{t.sources}</h4>
                  <ul>{references.map((url) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>)}</ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
      <section className="orientation-detail-closing">
        <div className="orientation-detail-closing-main">
          <h2>{t.campus}</h2>
          <p>{content.campusValue}</p>
          <p>{content.reassurance}</p>
          <a href="https://campusallemagne.tn/orientation">{t.continue} →</a>
        </div>
        <aside><strong>{t.caution}</strong><p>{t.disclaimer}</p></aside>
        <footer>Campus Allemagne · campusallemagne.tn</footer>
      </section>
    </article>
  );
}
