"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { PublicOrientationAnswers } from "@/lib/orientation/public";
import type { ResearchPiste } from "@/lib/orientation-engine/discovery/research-pistes";
import { filterSupplementalResearchPistes } from "@/lib/orientation-engine/result/supplemental";
import { OrientationRealPhoto } from "@/components/orientation/OrientationRealPhoto";
import { useOrientationUniversityMedia, universityPhotoKey } from "@/components/orientation/useOrientationUniversityMedia";

const copy = {
  fr: {
    heading: "Des universités à découvrir pour votre projet",
    supplementaryHeading: "D’autres universités à découvrir",
    supplementaryLead: "Voici d’autres programmes déjà documentés dans notre catalogue, en privilégiant vos villes souhaitées. Notre équipe étudiera leurs critères avant toute candidature.",
    lead: "Nous avons déjà retrouvé des programmes universitaires liés à votre domaine. Voici de premières pistes concrètes, en privilégiant votre ville lorsque c'est possible.",
    badge: "Piste documentée",
    why: "Pourquoi découvrir cette formation",
    source: "Découvrir le programme officiel",
    noResults: "Nous recherchons encore des programmes documentés pour votre domaine. Notre équipe pourra étudier d'autres possibilités avec vous.",
    reason: (city: string, programme: string) => `À ${city}, le programme « ${programme} » est une première piste de formation à explorer avec Campus Allemagne.`,
    disclaimer: "Ces pistes sont issues de notre catalogue de recherche : elles ne constituent ni une vérification de votre admissibilité ni une promesse d'admission. Notre équipe examine les conditions avant toute candidature.",
  },
  ar: {
    heading: "جامعات وبرامج يمكنك اكتشافها",
    supplementaryHeading: "جامعات أخرى تستحق الاكتشاف",
    supplementaryLead: "هذه برامج إضافية موثقة في قاعدة أبحاثنا، مع أولوية للمدن التي اخترتها. سيتحقق فريقنا من شروطها قبل أي تقديم.",
    lead: "وجدنا في قاعدة معلوماتنا برامج مرتبطة بمجال اهتمامك. نعرض لك مسارات أولية مع إعطاء الأفضلية للمدينة التي اخترتها كلما أمكن.",
    badge: "برنامج موثق للبحث",
    why: "لماذا قد يهمك هذا البرنامج",
    source: "البرنامج في الموقع الرسمي",
    noResults: "ما زلنا نبحث عن برامج موثقة تناسب مجال دراستك. يستطيع فريقنا دراسة خيارات أخرى معك.",
    reason: (city: string, programme: string) => `في ${city} يمكنك اكتشاف برنامج «${programme}» ومناقشة مدى ملاءمته مع فريق Campus Allemagne.`,
    disclaimer: "هذه خيارات من قاعدة أبحاثنا، وليست تأكيدًا على الأهلية أو ضمانًا للقبول. يراجع فريقنا الشروط قبل تقديم أي طلب.",
  },
  en: {
    heading: "Universities to explore for your studies",
    supplementaryHeading: "More universities to explore",
    supplementaryLead: "Here are further documented degree programmes, prioritising your chosen cities. Our team will review their entry requirements before any application.",
    lead: "We have found documented university programmes connected to your chosen field, prioritising your preferred city where possible.",
    badge: "Documented option",
    why: "Why explore this course",
    source: "Official course page",
    noResults: "We are still looking for documented programmes in your chosen field. Our team can explore other options with you.",
    reason: (city: string, programme: string) => `In ${city}, « ${programme} » is a course worth exploring with Campus Allemagne.`,
    disclaimer: "These are research-catalogue options, not confirmation of eligibility or admission. Our team reviews the requirements before you apply.",
  },
  de: {
    heading: "Hochschulen, die du entdecken kannst",
    supplementaryHeading: "Weitere Hochschulen entdecken",
    supplementaryLead: "Wir zeigen dir weitere dokumentierte Studiengänge mit Vorrang für deine Wunschstädte. Unser Team wird die Voraussetzungen vor jeder Bewerbung prüfen.",
    lead: "Wir haben bereits dokumentierte Studiengänge in deinem Fachgebiet gefunden. Wo möglich, bevorzugen wir deine Wunschstadt.",
    badge: "Dokumentierte Möglichkeit",
    why: "Warum sich dieser Studiengang lohnt",
    source: "Offizieller Studiengang",
    noResults: "Wir suchen noch nach dokumentierten Studiengängen für dein Fach. Unser Team kann weitere Möglichkeiten mit dir prüfen.",
    reason: (city: string, programme: string) => `In ${city} kannst du den Studiengang „${programme}“ mit Campus Allemagne näher entdecken.`,
    disclaimer: "Dies sind Möglichkeiten aus unserem Recherchekatalog, keine Bestätigung einer Zugangsberechtigung oder Zulassung. Vor einer Bewerbung prüft unser Team die Voraussetzungen.",
  },
} as const;

type ApiResponse = { items?: ResearchPiste[] };

export function OrientationResearchPistesCard({
  answers,
  locale,
  existingShortlist = [],
}: {
  answers: PublicOrientationAnswers;
  locale: Locale;
  existingShortlist?: Array<{ institution: string; programme: string; city: string | null }>;
}) {
  const [items, setItems] = useState<ResearchPiste[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const request = JSON.stringify({
    targetDegree: answers.targetDegree,
    targetField: answers.targetField,
    preferredCities: answers.preferredCities,
    studyLanguage: answers.studyLanguage,
    bacStatus: answers.bacStatus,
    targetSpecialization: answers.targetSpecialization,
    engineeringSpecialty: answers.engineeringSpecialty,
    scienceSpecialty: answers.scienceSpecialty,
  });

  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/orientation/research-pistes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: request,
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("research_unavailable");
        return response.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        setItems(Array.isArray(data.items) ? data.items.slice(0, 3) : []);
        setStatus("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("unavailable");
      });
    return () => controller.abort();
  }, [request]);

  const supplemental = filterSupplementalResearchPistes(items, existingShortlist);
  const medias = useOrientationUniversityMedia(
    supplemental.map(({ institution, city }) => ({ institution, city })),
  );
  const t = copy[locale];
  if (answers.bacStatus === "no_bac" || existingShortlist.length >= 3
    || (status !== "loading" && supplemental.length === 0 && existingShortlist.length > 0)) return null;

  return (
    <section className="mt-5 rounded-[var(--radius-panel)] border border-[var(--premium-border)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="orientation-research-pistes-title">
      <h3 id="orientation-research-pistes-title" className="text-xl font-semibold tracking-tight sm:text-2xl">{existingShortlist.length ? t.supplementaryHeading : t.heading}</h3>
      <p className="mt-2 max-w-[72ch] text-sm leading-6 text-[var(--muted)]">{existingShortlist.length ? t.supplementaryLead : t.lead}</p>
      {status === "loading" ? (
        <div className="mt-5 h-32 animate-pulse rounded-[var(--radius-control)] bg-[var(--premium-cream-soft)]" role="status" aria-label={t.heading} />
      ) : supplemental.length > 0 ? (
        <>
          <div className="mt-5 grid gap-4">
            {supplemental.map((item, index) => (
              <article key={`${item.institution}|${item.programme}|${item.city || ""}`}
                className="grid gap-4 overflow-hidden rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-start">
                <div className="order-last sm:order-first">
                  <span className="text-[11px] font-bold text-[var(--brand-strong)]">{String(index + existingShortlist.length + 1).padStart(2, "0")} · {t.badge}</span>
                  <h4 className="mt-2 text-base font-semibold leading-6">{item.institution} — {item.programme}</h4>
                  <p className="mt-1 text-xs text-[var(--muted)]">{[item.city, item.teachingLanguage].filter(Boolean).join(" · ")}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--foreground)]"><strong>{t.why} : </strong>{t.reason(item.city || item.institution, item.programme)}</p>
                  <a className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-[var(--brand-strong)] underline underline-offset-4" href={item.officialUrl} target="_blank" rel="noopener noreferrer">{t.source} ↗</a>
                </div>
                <OrientationRealPhoto className="order-first h-40 sm:order-last sm:h-40" locale={locale}
                  universityName={item.institution}
                  media={medias[universityPhotoKey(item.institution, item.city)] || null} />
              </article>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[var(--muted)]">{t.disclaimer}</p>
        </>
      ) : (
        <p className="mt-5 text-sm leading-6 text-[var(--muted)]" role="status">{t.noResults}</p>
      )}
    </section>
  );
}
