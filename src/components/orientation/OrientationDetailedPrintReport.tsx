"use client";

import "./OrientationDetailedPrintReport.css";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { useOrientationUniversityMedia, universityPhotoKey } from "@/components/orientation/useOrientationUniversityMedia";
import { findCuratedUniversityMedia } from "@/lib/orientation-engine/discovery/curated-university-media";
import { orientationCandidatePriority } from "@/lib/orientation-engine/writer/candidate-priority";
import { formatPersonalizedFactValue } from "@/components/orientation/OrientationOnePagePrintReport";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers, PublicOrientationIdentity } from "@/lib/orientation/public";
import type { OrientationPublicPersonalizedResult } from "@/lib/orientation-engine/result/types";
import type { OrientationUniversityMedia } from "@/lib/orientation-engine/types";
import type { ResearchPiste } from "@/lib/orientation-engine/discovery/research-pistes";
import { filterSupplementalResearchPistes } from "@/lib/orientation-engine/result/supplemental";

const copy = {
  fr: {
    eyebrow: "Rapport Campus Allemagne",
    title: "Votre projet pour l’Allemagne prend forme.",
    subtitle: "Les formations proposées, votre priorité et les étapes à préparer avec Campus Allemagne.",
    profile: "Votre profil", degree: "Niveau visé", field: "Domaine", german: "Allemand",
    priority: "Votre priorité maintenant", next: "Vous",
    summary: "Ce que nous retenons de votre dossier", summaryLead: "Votre dossier est encourageant.", signal: "Ce qui ressort",
    journey: "Votre parcours vers l’Allemagne", journeySteps: ["Orientation", "Préparation", "Sélection finale", "Candidatures", "Étapes administratives"],
    preferredCity: "Votre ville reste prioritaire", cityFallback: "Votre ville de préférence reste au cœur de la recherche. Nous élargissons provisoirement les pistes et vérifierons les programmes dans cette ville avec vous.",
    researchHeading: "Autres universités à découvrir", researchBadge: "Piste documentée", researchWhy: "Pourquoi découvrir cette formation", researchSource: "Découvrir le programme officiel",
    researchNote: "Ces formations viennent de notre catalogue documentaire. Leur présence ne garantit pas votre admissibilité : notre équipe doit vérifier les conditions avant toute candidature.",
    researchUnavailable: "Nous continuons à rechercher des pistes documentées complémentaires.",
    programmes: "Vos formations à explorer", programmeIntro: "Ces pistes proviennent de votre orientation. Elles ne constituent pas des admissions garanties.",
    verified: "Informations vérifiées", reviewing: "À vérifier avec l'université",
    why: "Pourquoi cette piste", facts: "Repères vérifiés", sources: "Sources des informations",
    missingPhoto: "Photo d'université non disponible avec une licence vérifiée",
    photo: "Photo de l'université", photoCredit: "Photo", cropped: "image recadrée pour la mise en page",
    roadmap: "Vos prochaines étapes", campus: "L'accompagnement Campus Allemagne",
    continue: "Continuer mon projet avec Campus Allemagne", caution: "Important",
    disclaimer: "Ce dossier est une aide à la préparation. Seules les universités décident de l'admission et les autorités compétentes décident du visa. Les conditions et dates doivent être revérifiées avant de candidater.",
    noVerifiedFacts: "Les conditions détaillées restent à vérifier auprès de l'université.",
    factNames: { programme_exists: "Existence du programme", city: "Ville", accepted_language_certificates: "Certificats acceptés", application_url: "Lien de candidature", studienkolleg_requirement: "Studienkolleg", degree_level: "Diplôme", teaching_language: "Langue d'enseignement", intake_terms: "Rentrée", application_route: "Candidature", german_language_requirement: "Allemand requis", english_language_requirement: "Anglais requis", tuition_or_semester_fees: "Frais", winter_deadline: "Date limite (hiver)", summer_deadline: "Date limite (été)" },
  },
  ar: {
    eyebrow: "تقرير Campus Allemagne", title: "مشروعك للدراسة في ألمانيا يتضح.",
    subtitle: "التخصصات المقترحة وأولويتك الحالية والخطوات التي يمكنك إعدادها مع Campus Allemagne.",
    profile: "ملفك", degree: "الدرجة المطلوبة", field: "المجال", german: "الألمانية",
    priority: "أولويتك الآن", next: "أنت",
    summary: "ما نستخلصه من ملفك", summaryLead: "ملفك مشجع.", signal: "المسارات المقترحة",
    journey: "مسارك نحو ألمانيا", journeySteps: ["التوجيه", "التحضير", "الاختيار النهائي", "التقديم", "الخطوات الإدارية"],
    preferredCity: "مدينتك تبقى أولوية", cityFallback: "تظل مدينتك المختارة أولوية. ندرس مؤقتًا خيارات إضافية ونواصل التحقق من البرامج في مدينتك.",
    researchHeading: "جامعات أخرى تستحق الاكتشاف", researchBadge: "مسار موثق للبحث", researchWhy: "لماذا تكتشف هذا التخصص", researchSource: "الموقع الرسمي للبرنامج",
    researchNote: "هذه خيارات من قاعدة أبحاثنا وليست ضمانًا للأهلية أو القبول. يتأكد فريقنا من الشروط قبل التقديم.",
    researchUnavailable: "ما زلنا نبحث عن برامج أخرى موثقة.", programmes: "برامج تستحق الاستكشاف",
    programmeIntro: "هذه مسارات ناتجة عن توجيهك ولا تعني ضمان القبول.",
    verified: "معلومات موثقة", reviewing: "يلزم التحقق من الجامعة",
    why: "لماذا هذا المسار", facts: "معلومات موثقة", sources: "مصادر المعلومات",
    missingPhoto: "لا تتوفر صورة للجامعة بترخيص موثق", photo: "صورة الجامعة", photoCredit: "الصورة", cropped: "تم اقتصاص الصورة لأغراض التنسيق",
    roadmap: "خطواتك القادمة", campus: "مرافقة Campus Allemagne",
    continue: "متابعة مشروعي مع Campus Allemagne", caution: "مهم",
    disclaimer: "هذا الملف يساعد على التحضير، ولا يضمن القبول. الجامعة هي التي تقرر القبول، والجهات المختصة هي التي تقرر التأشيرة. تحقق من الشروط والمواعيد قبل التقديم.",
    noVerifiedFacts: "يجب التحقق من شروط البرنامج لدى الجامعة.",
    factNames: { programme_exists: "وجود البرنامج", city: "المدينة", accepted_language_certificates: "شهادات اللغة المقبولة", application_url: "رابط التقديم", studienkolleg_requirement: "السنة التحضيرية", degree_level: "الدرجة", teaching_language: "لغة الدراسة", intake_terms: "بداية الدراسة", application_route: "التقديم", german_language_requirement: "الألمانية المطلوبة", english_language_requirement: "الإنجليزية المطلوبة", tuition_or_semester_fees: "الرسوم", winter_deadline: "آخر أجل (شتاء)", summer_deadline: "آخر أجل (صيف)" },
  },
  en: {
    eyebrow: "Personalised orientation dossier", title: "Your study project in Germany",
    subtitle: "The suggested programmes, your current priority, and the next steps with Campus Allemagne.",
    profile: "Your profile", degree: "Target degree", field: "Field", german: "German",
    priority: "Your priority now", next: "You",
    summary: "What we take from your profile", summaryLead: "Your profile looks encouraging.", signal: "Current suggestions",
    journey: "Your journey to Germany", journeySteps: ["Orientation", "Preparation", "Final selection", "Applications", "Administration"],
    preferredCity: "Your preferred city remains a priority", cityFallback: "Your chosen city remains a priority. We are exploring other options while we continue checking programmes there.",
    researchHeading: "More universities to explore", researchBadge: "Documented option", researchWhy: "Why explore this programme", researchSource: "Official programme page",
    researchNote: "These research catalogue options do not confirm eligibility or admission. Requirements must be checked before applying.",
    researchUnavailable: "We are continuing to look for documented supplementary options.", programmes: "Programmes to explore",
    programmeIntro: "These options come from your orientation. They are not guaranteed admissions.",
    verified: "Verified information", reviewing: "University confirmation needed",
    why: "Why this option", facts: "Verified facts", sources: "Information sources",
    missingPhoto: "No university photograph with a verified licence available",
    photo: "University photograph", photoCredit: "Photo", cropped: "image cropped for layout",
    roadmap: "Your next steps", campus: "Campus Allemagne support",
    continue: "Continue with Campus Allemagne", caution: "Important",
    disclaimer: "This dossier helps you prepare; universities decide admissions and the competent authorities decide visas. Recheck conditions and deadlines before applying.",
    noVerifiedFacts: "Detailed conditions still require confirmation with the university.",
    factNames: { programme_exists: "Programme existence", city: "City", accepted_language_certificates: "Accepted certificates", application_url: "Application link", studienkolleg_requirement: "Studienkolleg", degree_level: "Degree", teaching_language: "Teaching language", intake_terms: "Intake", application_route: "Application", german_language_requirement: "German requirement", english_language_requirement: "English requirement", tuition_or_semester_fees: "Fees", winter_deadline: "Winter deadline", summer_deadline: "Summer deadline" },
  },
  de: {
    eyebrow: "Persönliches Orientierungsdossier", title: "Dein Studienprojekt in Deutschland",
    subtitle: "Studiengänge, deine aktuelle Priorität und die nächsten Schritte mit Campus Allemagne.",
    profile: "Dein Profil", degree: "Studienabschluss", field: "Fachgebiet", german: "Deutsch",
    priority: "Deine Priorität jetzt", next: "Du",
    summary: "Was wir aus deinem Profil mitnehmen", summaryLead: "Dein Profil ist vielversprechend.", signal: "Aktuelle Vorschläge",
    journey: "Dein Weg nach Deutschland", journeySteps: ["Orientierung", "Vorbereitung", "Endauswahl", "Bewerbungen", "Formalitäten"],
    preferredCity: "Deine Wunschstadt bleibt wichtig", cityFallback: "Deine Wunschstadt bleibt unsere Priorität. Wir prüfen zusätzliche Möglichkeiten und suchen dort weiter.",
    researchHeading: "Weitere Hochschulen entdecken", researchBadge: "Dokumentierte Möglichkeit", researchWhy: "Warum dieser Studiengang", researchSource: "Offizielle Programmseite",
    researchNote: "Diese recherchierten Optionen sind keine Bestätigung der Zulassung. Wir prüfen die Anforderungen vor einer Bewerbung.",
    researchUnavailable: "Wir recherchieren weitere dokumentierte Optionen.", programmes: "Studiengänge zum Prüfen",
    programmeIntro: "Diese Vorschläge stammen aus deiner Orientierung und sind keine Zulassungsgarantie.",
    verified: "Geprüfte Informationen", reviewing: "Noch mit der Hochschule zu prüfen",
    why: "Warum diese Option", facts: "Geprüfte Fakten", sources: "Informationsquellen",
    missingPhoto: "Kein Hochschulfoto mit geprüfter Lizenz verfügbar",
    photo: "Hochschulfoto", photoCredit: "Foto", cropped: "Bild für das Layout zugeschnitten",
    roadmap: "Deine nächsten Schritte", campus: "Begleitung durch Campus Allemagne",
    continue: "Projekt mit Campus Allemagne fortsetzen", caution: "Wichtig",
    disclaimer: "Dieses Dossier dient der Vorbereitung. Hochschulen entscheiden über Zulassungen, die zuständigen Behörden über Visa. Bedingungen und Fristen vor einer Bewerbung erneut prüfen.",
    noVerifiedFacts: "Die genauen Voraussetzungen sind noch mit der Hochschule zu klären.",
    factNames: { programme_exists: "Studiengang vorhanden", city: "Stadt", accepted_language_certificates: "Anerkannte Zertifikate", application_url: "Bewerbungslink", studienkolleg_requirement: "Studienkolleg", degree_level: "Abschluss", teaching_language: "Unterrichtssprache", intake_terms: "Studienbeginn", application_route: "Bewerbung", german_language_requirement: "Deutsch", english_language_requirement: "Englisch", tuition_or_semester_fees: "Gebühren", winter_deadline: "Winterfrist", summer_deadline: "Sommerfrist" },
  },
} as const;

type DocumentedState = { key: string; items: ResearchPiste[]; ready: boolean };

function useDetailedResearchPistes(
  answers: PublicOrientationAnswers,
  selected: OrientationPublicPersonalizedResult["selected"],
) {
  const key = JSON.stringify({
    targetDegree: answers.targetDegree,
    targetField: answers.targetField,
    preferredCities: answers.preferredCities,
    studyLanguage: answers.studyLanguage,
    bacStatus: answers.bacStatus,
    targetSpecialization: answers.targetSpecialization,
    engineeringSpecialty: answers.engineeringSpecialty,
    scienceSpecialty: answers.scienceSpecialty,
  });
  const [state, setState] = useState<DocumentedState>({ key: "", items: [], ready: false });
  const skip = answers.bacStatus === "no_bac" || selected.length >= 3;
  useEffect(() => {
    if (skip) return;
    const controller = new AbortController();
    void fetch("/api/orientation/research-pistes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: key,
      cache: "no-store",
      signal: controller.signal,
    }).then((response) => {
      if (!response.ok) throw new Error("research_unavailable");
      return response.json() as Promise<{ items?: ResearchPiste[] }>;
    }).then((data) => {
      if (!controller.signal.aborted) setState({ key, items: Array.isArray(data.items) ? data.items.slice(0, 12) : [], ready: true });
    }).catch(() => {
      if (!controller.signal.aborted) setState({ key, items: [], ready: true });
    });
    return () => controller.abort();
  }, [key, skip]);
  const ready = skip || (state.key === key && state.ready);
  const items = state.key === key ? state.items : [];
  return {
    supplemental: filterSupplementalResearchPistes(items, selected),
    ready,
  };
}

function licensedPhoto(media: OrientationUniversityMedia | null | undefined): OrientationUniversityMedia | null {
  if (!media?.coverImageUrl || !media.coverImageSourceUrl || !media.coverImageLicense) return null;
  if (!/^https:\/\//i.test(media.coverImageUrl) || !/^https:\/\//i.test(media.coverImageSourceUrl)) return null;
  if (!/^(?:CC0(?:\s|$)|CC BY(?:-SA)?(?:\s|$))/i.test(media.coverImageLicense)) return null;
  return media;
}

function licenseHref(license: string): string | null {
  if (/^CC0(?:\s+1\.0)?$/i.test(license)) return "https://creativecommons.org/publicdomain/zero/1.0/";
  const match = /^CC BY(-SA)?\s+(2\.0|2\.5|3\.0|4\.0)$/i.exec(license);
  return match ? "https://creativecommons.org/licenses/by" + (match[1] ? "-sa" : "") + "/" + match[2] + "/" : null;
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
                  <figcaption>{t.photoCredit}: {photo.coverImageAttribution || option.institution} · {licenseHref(photo.coverImageLicense || "") ? <a href={licenseHref(photo.coverImageLicense || "") || "#"} target="_blank" rel="noopener noreferrer">{photo.coverImageLicense}</a> : photo.coverImageLicense} · {t.cropped} · <a href={photo.coverImageSourceUrl || "#"} target="_blank" rel="noopener noreferrer">{photo.coverImageSourceUrl}</a></figcaption>
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
